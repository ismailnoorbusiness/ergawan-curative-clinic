/**
 * Renders an article body written as plain text with blank-line paragraphs,
 * "## " headings and "- " bullet lines.
 */
export default function ArticleBody({ body }) {
  if (!body) return null;
  const blocks = String(body).split(/\n\s*\n/);

  return (
    <div className="article-body">
      {blocks.map((block, index) => {
        const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
        if (lines.length === 0) return null;

        if (lines[0].startsWith("## ")) {
          return (
            <div key={index}>
              <h2>{lines[0].replace(/^##\s+/, "")}</h2>
              {lines.length > 1 && <p>{lines.slice(1).join(" ")}</p>}
            </div>
          );
        }

        if (lines.every((line) => line.startsWith("- "))) {
          return (
            <ul key={index}>
              {lines.map((line) => (
                <li key={line}>{line.replace(/^-\s+/, "")}</li>
              ))}
            </ul>
          );
        }

        return <p key={index}>{lines.join(" ")}</p>;
      })}
    </div>
  );
}