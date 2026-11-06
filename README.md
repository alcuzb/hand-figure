# SnapPuzzle

**Qo‘l harakatlari bilan boshqariladigan fotobutka va 3×3 boshqotirma.** / **A gesture-controlled photobooth and 3×3 photo puzzle.**

## O‘zbekcha
1. Ikkala qo‘l ko‘rsatkich barmog‘i bilan ramka yasang.
2. Ikkala qo‘lda bosh va ko‘rsatkich barmoqni chimdib ushlang — 3 soniyadan keyin surat olinadi.
3. Bo‘laklarni chimdib ko‘chirib, suratni yig‘ing.
4. Yig‘ilgach mushtni qisqa ushlang — surat albomga qo‘shiladi (3 tagacha).
5. **Suratlarni yuklab olish** — albom bitta PNG fayl bo‘ladi.

Ishga tushirish: `python -m http.server 5500`, so‘ng http://localhost:5500 ni oching va kamera ruxsatini bering (Chrome/Edge tavsiya etiladi; birinchi marta internet kerak).

## English
Frame the shot with both index fingers, pinch with both hands to start a 3-second countdown, solve the puzzle by pinching and moving tiles, then hold a fist to save it to the album (up to 3). Download the album as one PNG.

Run: `python -m http.server 5500` and open http://localhost:5500. Built with MediaPipe Tasks Vision and Canvas 2D. Photos never leave the browser.

MIT License
