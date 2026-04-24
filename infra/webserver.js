function getOrigin() {
  if (["development", "test"].includes(process.env.NODE_ENV)) {
    return "http://localhost:3000";
  }

  if (process.env.CODESPACES === "true") {
    const port = process.env.PORT ?? "3000";
    const codespaceName = process.env.CODESPACE_NAME;
    const forwardingDomain =
      process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN;

    return `https://${codespaceName}-${port}.${forwardingDomain}`;
  }

  if (process.env.VERCEL_ENV === "preview") {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "https://iisrael.com.br";
}

const webserver = {
  origin: getOrigin(),
};

export default webserver;
