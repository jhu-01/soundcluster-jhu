# SoundCluster Design

## Visual Direction

- Dark space scene.
- R3F-rendered starfield.
- Track nodes are small glowing points.
- UI panels use dark glass surfaces.
- The interface is a tool surface, not a landing page.

## Layout

```text
Top left       SoundCluster brand
Top center     Search input + Search button
Top right      Reset button
Left panel     Search Results
Center         3D emotion space
Right panel    Emotions axis toggles
Bottom center  Selected track HUD
Bottom left    Response debug panel
Bottom right   Share button
```

## Search Results Panel

- Starts at the same top height as the Emotions panel.
- Shows compact rows.
- Row content:
  - album image
  - title
  - artist
  - SVG add button
- The header does not show a result count.
- The footer shows `Powered by iTunes API`.
- More than five results scroll inside the panel.

## Search Bar

- Placeholder: `Search by song title or artist...`
- The initial helper message is hidden to avoid duplicating the placeholder.
- Search status and error messages appear only when needed.

## Emotions Panel

The panel controls projection axes only.

```text
energy
valence
tempoDensity
spaceDepth
tension
```

Rules:

- Values are not shown in this panel.
- Values are not user-editable.
- Toggles decide whether an axis participates in 3D projection.
- At least two axes remain active.

## 3D Scene

- The scene shows sparse XYZ axis lines.
- Axis text labels are not shown.
- The XY grid is not shown.
- Track positions are recalculated from the selected active axes.
- OrbitControls allow drag rotation and scroll zoom.
- The scene does not auto-rotate by itself.

## Track Nodes

- Nodes use stable colors derived from track identity.
- Palette stays within violet, lavender, cyan, and soft magenta.
- Track nodes are emphasized by scale:
  - selected: around 3x
  - nearest: around 2x
  - farthest: around 2x
- Nearest relation uses a solid line.
- Farthest relation uses a dashed line.

## Metadata Popups

- Hovered non-pinned tracks show a popup above the node.
- Nearest and farthest tracks keep pinned popups.
- Selected track metadata belongs in the bottom HUD.
- Popup content:
  - album image or fallback
  - title
  - artist
  - information button
- The information button opens five emotion values.

## Selected Track HUD

- Shows selected track album image, title, artist.
- Includes an information button for five emotion values.
- Includes a remove button.
- Removing the selected track clears the selected-track emotion panel state.

## Debug Panel

- The response panel is a development aid.
- It shows LRCLIB and Gemini debug output.
- It includes an opacity slider.
- It can be hidden or removed for production.

## Share UI

- Share button opens share modal.
- The modal requests `/api/share-snapshots`.
- The generated URL uses `?share=<shareId>`.

## Color Tokens

```css
:root {
  --color-bg: #02040a;
  --color-text-primary: #f7f8ff;
  --color-text-secondary: #a9b0c3;
  --color-accent-purple: #7c4dff;
  --color-accent-cyan: #34e5d6;
  --color-danger: #ff5570;
  --radius-panel: 14px;
  --radius-control: 10px;
}
```

## Current API References

- iTunes search: `GET /api/itunes/search`
- Lyrics search: `GET /api/lyrics/search`
- Analysis stream: `GET /api/analyze/stream`
- Share create: `POST /api/share-snapshots`
- Share read: `GET /api/share-snapshots/:shareId`
