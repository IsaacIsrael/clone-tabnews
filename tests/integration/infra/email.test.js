import email from "infra/email.js";
import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitAllServices();
});

describe("infra/email.js", () => {
  test("send()", async () => {
    await orchestrator.deleteAllEmails();
    await email.send({
      from: "InSystem <contato@alerts.iisrael.com.br>",
      to: "contato@curso.dev",
      subject: "Subject test",
      text: "Body test",
    });

    await email.send({
      from: "InSystem <contato@alerts.iisrael.com.br>",
      to: "contato@curso.dev",
      subject: "Last email sent",
      text: "Body of the last email",
    });

    const lastEmail = await orchestrator.getLastEmail();

    expect(lastEmail.sender).toBe("<contato@alerts.iisrael.com.br>");
    expect(lastEmail.recipients[0]).toBe("<contato@curso.dev>");
    expect(lastEmail.subject).toBe("Last email sent");
    expect(lastEmail.text).toBe("Body of the last email\n");
  });
});
