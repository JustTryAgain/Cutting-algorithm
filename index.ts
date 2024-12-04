import * as http from "http";

const server = http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>My TypeScript Page</title>
    </head>
    <body>
      <h1>Hello, TypeScript!</h1>
      <p>This page is rendered using TypeScript!</p>
    </body>
    </html>
  `);
});

server.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});
