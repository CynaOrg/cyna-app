const express = require("express");
const path = require("path");
const app = express();

// Redirect bare domain to www (301 permanent)
app.use((req, res, next) => {
  if (req.hostname === "cyna.it") {
    return res.redirect(301, `https://www.cyna.it${req.originalUrl}`);
  }
  next();
});

// Serve Angular static files
app.use(express.static(path.join(__dirname, "www/browser")));

// SPA fallback - serve index.html for all unmatched routes
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "www/browser/index.html"));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
