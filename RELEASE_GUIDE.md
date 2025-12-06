# Hướng dẫn Release & Publish

Tài liệu này hướng dẫn cách đóng gói và phát hành hai thành phần chính của dự án:

1.  **Chrome Extension**: Release trên GitHub.
2.  **MCP CLI Tool**: Publish lên thư viện NPM.

---

## 1. Release Chrome Extension trên GitHub

### Bước 1: Build Extension

Tại thư mục gốc của dự án (`/`), chạy lệnh build:

```bash
npm run build
```

Sau khi chạy xong, thư mục `dist/` sẽ được tạo ra chứa mã nguồn extension đã được biên dịch.

### Bước 2: Đóng gói (Zip)

Để người dùng cài đặt, bạn cần nén nội dung thư mục `dist`:

1.  Mở thư mục `dist`.
2.  Chọn **tất cả các file và thư mục con** bên trong nó (bao gồm `manifest.json`, `extension`, `assets`...).
3.  Nén lại thành file `.zip`.
    - _Ví dụ tên file:_ `youtube-controller-extension-v1.0.0.zip`.
    - **Lưu ý quan trọng**: Không nén chính thư mục `dist`, hãy nén **nội dung** bên trong nó. Khi giải nén file zip ra, người dùng phải thấy ngay file `manifest.json`.

### Bước 3: Tạo Release trên GitHub

1.  Truy cập trang repository của bạn trên GitHub.
2.  Ở thanh bên phải, mục **Releases**, chọn **Create a new release**.
3.  **Choose a tag**: Nhập version mới (ví dụ `v1.0.0`) và chọn **Create new tag**.
4.  **Release title**: Nhập tiêu đề (ví dụ `Release v1.0.0`).
5.  **Description**: Mô tả các tính năng mới hoặc thay đổi.
6.  **Attach binaries**: Kéo thả file `.zip` bạn vừa tạo vào khu vực upload.
7.  Nhấn **Publish release**.

---

## 2. Publish MCP Tool lên NPM

Công cụ CLI nằm trong thư mục `mcp/`. Để publish lên NPM, bạn cần điều chỉnh cấu hình một chút.

### Bước 1: Cấu hình `package.json`

Mở file `mcp/package.json` và thực hiện các thay đổi sau:

1.  **Tên gói (`name`)**:
    - Hiện tại đang là `"mcp"`. Tên này chắc chắn đã bị trùng trên NPM.
    - Hãy đổi thành một tên duy nhất, ví dụ: `"youtube-controller-mcp"` hoặc dùng scope `"@username/youtube-controller-mcp"`.
2.  **Quyền truy cập (`private`)**:

    - Xóa dòng `"private": true` hoặc đổi thành `"private": false` để cho phép publish công khai.

3.  **Phiên bản (`version`)**:
    - Đảm bảo phiên bản là `1.0.0` (hoặc tăng lên nếu bạn update).

**Ví dụ:**

```json
{
  "name": "@baobao/youtube-controller-mcp",
  "version": "1.0.0",
  "private": false,
  ...
}
```

### Bước 2: Build MCP Tool

Mở terminal tại thư mục gốc hoặc `mcp/` và chạy:

```bash
# Di chuyển vào thư mục mcp
cd mcp

# Cài đặt dependencies (nếu chưa)
bun install

# Build mã nguồn
bun run build
```

Lệnh này sẽ tạo ra thư mục `mcp/build` chứa file `index.js`.

### Bước 3: Login và Publish

Tại terminal (đang ở thư mục `mcp`):

1.  **Login vào NPM** (nếu chưa):

    ```bash
    npm login
    ```

    Làm theo hướng dẫn trên màn hình để xác thực.

2.  **Publish gói**:
    ```bash
    npm publish --access public
    ```
    - Lưu ý: Flag `--access public` là bắt buộc nếu bạn dùng tên gói dạng scope (`@username/...`) lần đầu tiên.

### Bước 4: Kiểm tra

Sau khi publish thành công, bạn hoặc người dùng khác có thể chạy tool ngay lập tức mà không cần cài đặt bằng lệnh:

```bash
npx @baobao/youtube-controller-mcp
```

(Thay `@baobao/youtube-controller-mcp` bằng tên gói bạn đã đặt).
