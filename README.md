## Employee Insights Dashboard

This is a 4-screen Employee Insights Dashboard built with **React + TypeScript + Vite**, using only native browser APIs, raw CSS, and custom logic for virtualization and image processing.

### Screens

- **Login**: `/login` with Context-based auth and `localStorage` persistence.
- **List Page**: `/list` fetches data from `https://backend.jotish.in/backend_dev/gettabledata.php` and renders a high-performance virtualized grid.
- **Details Page**: `/details/:id` captures a camera photo and collects a handwritten signature on top of it.
- **Analytics Page**: `/analytics` shows the merged audit image plus SVG-based salary and city visualizations.

### Running the app

```bash
cd employee-insights-dashboard
npm install
npm run dev
```

Open the printed localhost URL in a browser. Use credentials **`testuser` / `Test123`**.

---

### Auth & Routing

- Auth state lives in `src/auth/AuthContext.tsx` and is exposed via `useAuth`.
- On successful login, `isAuthenticated` is stored in `localStorage` under `employee-insights-auth`.
- The `PrivateRoute` wrapper in `src/App.tsx` protects `/list`, `/details/:id`, and `/analytics`. Direct navigation to these routes while unauthenticated redirects to `/login`.
- On refresh, the `AuthProvider` rehydrates auth state from `localStorage`, so the session persists.

---

### High-Performance Virtualized Grid

The grid is implemented in `src/components/VirtualizedTable.tsx` with **no third‑party virtualization helpers**.

Let:

- \( H_r \) = `rowHeight` in pixels
- \( H_v \) = `viewportHeight` (scroll container client height)
- \( S \) = `scrollTop` (current vertical scroll offset)
- \( B \) = `overscan` (buffer rows before/after viewport)
- \( N \) = total number of rows

The core math:

1. **Visible row count**
   \[
   C_v = \left\lceil \frac{H_v}{H_r} \right\rceil
   \]
2. **Start index**
   \[
   i_s = \max\left(0, \left\lfloor \frac{S}{H_r} \right\rfloor - B \right)
   \]
3. **End index (non-inclusive)**
   \[
   i_e = \min\left(N, i_s + C_v + 2B \right)
   \]
4. **Pixel offset for the slice**
   \[
   Y_{\text{offset}} = i_s \cdot H_r
   \]

Implementation-wise:

- The outer `virtualized-container` is a fixed-height scrollable `<div>`.
- Inside it, `virtualized-inner` has `height = N * rowHeight` to preserve the correct scrollbar size.
- We compute `startIndex`, `endIndex`, and `offsetY` from the formulas above and `slice` the data array accordingly.
- The visible rows are rendered inside a child wrapper with `transform: translateY(offsetY)` so they appear in the right vertical position without rendering all rows.

This ensures the DOM only contains the rows near the viewport plus a small buffer, so rendering stays fast even for large datasets.

---

### Camera, Signature & Image Merging

All implemented in `src/pages/DetailsPage.tsx`:

1. **Camera stream**
   - Calls `navigator.mediaDevices.getUserMedia({ video: true })`.
   - The returned `MediaStream` is assigned to a `<video>` element via `videoRef.current.srcObject`.
2. **Capture photo**
   - A hidden `<canvas>` (`photoCanvasRef`) is sized to match the video frame (`video.videoWidth` / `video.videoHeight`).
   - On **Capture**, we draw the current frame with:
     ```ts
     ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
     ```
3. **Signature overlay**
   - A second `<canvas>` (`signatureCanvasRef`) is layered visually above the captured image area.
   - Pointer events (`onPointerDown`, `onPointerMove`, `onPointerUp`) are used to collect strokes:
     - On down: `ctx.beginPath()` and `ctx.moveTo(x, y)`.
     - On move: `ctx.lineTo(x, y); ctx.stroke();`.
4. **Merging into one "Audit Image"**
   - A transient offscreen canvas is created with the same dimensions as the captured photo.
   - The merge logic:
     ```ts
     ctx.drawImage(photoCanvas, 0, 0);
     ctx.drawImage(signatureCanvas, 0, 0);
     const dataUrl = mergedCanvas.toDataURL('image/png');
     ```
   - The resulting base64 data URL is stored in `sessionStorage` under `"audit-image"` and also held in React state.
   - The Analytics page reads this stored value and renders it as the final audit image.

This design keeps camera capture, signature drawing, and merging in **pure browser primitives** (video, canvas, and data URLs) without external libraries.

---

### SVG Chart & Map

All visualization is pure SVG in `src/pages/AnalyticsPage.tsx`.

- Salary per city:
  - We aggregate rows by `city` to compute `totalSalary` and `count`.
  - Bars are positioned along the x‑axis at uniform intervals, and their height is proportional to `totalSalary / maxSalary`.
  - Only `<rect>` and `<text>` elements are used—no chart utilities.
- City map:
  - A static map rectangle approximates a simple region.
  - Cities have manually curated coordinates in `cityCoordinates`:
    ```ts
    const cityCoordinates: Record<string, { x: number; y: number }> = {
      Mumbai: { x: 80, y: 140 },
      Delhi: { x: 110, y: 70 },
      Bengaluru: { x: 100, y: 170 },
      Hyderabad: { x: 115, y: 155 },
      Chennai: { x: 115, y: 190 },
      Pune: { x: 85, y: 150 },
      Kolkata: { x: 150, y: 110 },
    };
    ```
  - Each city is drawn as a `<circle>` with radius based on `count`, plus a `<text>` label offset from the dot.
  - For any unknown city name not in the mapping, a fallback approximate position is used.

No map libraries (Leaflet, Google Maps, etc.) are used; the "map" is a simple, controlled SVG coordinate system.

---

### Intentional Bug (Required by Spec)

The app intentionally contains **one** performance bug by design, located in `src/components/VirtualizedTable.tsx`.

- In the `useEffect` that attaches the scroll and resize listeners, the dependency array is omitted:
  ```ts
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handleResize = () => {
      setViewportHeight(el.clientHeight);
    };
    handleResize();
    el.addEventListener('scroll', onScroll);
    window.addEventListener('resize', handleResize);
    return () => {
      el.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', handleResize);
    };
  });
  ```
- Because the effect runs on every render with a **fresh `onScroll` callback**, the cleanup removes the *previous* listener, and a new one is added afterward.
- Under heavy usage, this can lead to:
  - Multiple `scroll` listeners existing temporarily.
  - Extra memory usage and slightly redundant work per scroll event.

**Why this bug?**

- It is subtle but realistic: missing dependency arrays and re-created closures are a common source of performance regressions in React apps.
- The grid still behaves correctly, so functional testing passes, but profiling will reveal extra listeners and unnecessary work.
- Fixing it would be as simple as adding a proper dependency array and stabilizing callbacks.

---

### Notes & Assumptions

- The exact shape of the backend response from `gettabledata.php` is not documented here. The mapper in `ListPage` tries to infer reasonable fields:
  - `id` from `row.id` (or index).
  - `name` from `row.name` or `row.employee_name`.
  - `city` from `row.city` or `row.location`.
  - `salary` from `row.salary` or `row.ctc`.
- If the backend schema differs, you only need to adjust the mapping in `src/pages/ListPage.tsx` while keeping the virtualization and visualization logic intact.

