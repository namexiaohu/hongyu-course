/** Solid-color stylesheet for html2canvas export (no color-mix / oklab). */
export const CERTIFICATE_EXPORT_CSS = `
.certificate-frame {
  border: 3px solid #1a2a4a;
  padding: 10px;
  background: #ffffff;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.08);
  position: relative;
  box-sizing: border-box;
}
.certificate-frame::before {
  display: none !important;
}
.certificate-inner {
  border: 1px solid #ebebeb;
  padding: 48px 56px;
  text-align: center;
  position: relative;
  min-height: 520px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  background: #ffffff;
}
.certificate-inner::before,
.certificate-inner::after {
  content: '';
  position: absolute;
  width: 40px;
  height: 40px;
  border-color: #1a2a4a;
  border-style: solid;
}
.certificate-inner::before {
  top: 12px;
  left: 12px;
  border-width: 2px 0 0 2px;
}
.certificate-inner::after {
  top: 12px;
  right: 12px;
  border-width: 2px 2px 0 0;
}
.corner-bl, .corner-br {
  position: absolute;
  width: 40px;
  height: 40px;
  border-color: #1a2a4a;
  border-style: solid;
}
.corner-bl {
  bottom: 12px;
  left: 12px;
  border-width: 0 0 2px 2px;
}
.corner-br {
  bottom: 12px;
  right: 12px;
  border-width: 0 2px 2px 0;
}
.cert-logo { margin-bottom: 20px; }
.cert-logo svg { display: block; }
.cert-badge {
  display: inline-flex;
  align-items: center;
  padding: 6px 18px;
  background: rgba(20, 110, 245, 0.06);
  border: 1px solid rgba(20, 110, 245, 0.2);
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  color: #146ef5;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  margin-bottom: 24px;
}
.cert-title {
  font-family: Georgia, "Times New Roman", serif;
  font-size: 40px;
  font-weight: 400;
  margin: 0 0 12px;
  line-height: 1.25;
  letter-spacing: 0.3px;
  color: #080808;
}
.cert-awarded {
  font-size: 13px;
  color: #ababab;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin: 0 0 12px;
}
.cert-name {
  font-family: Georgia, "Times New Roman", serif;
  font-size: 36px;
  font-weight: 400;
  color: #080808;
  border-bottom: 2px solid #080808;
  padding-bottom: 8px;
  margin-bottom: 8px;
  display: inline-block;
  min-width: 240px;
}
.cert-course {
  color: #363636;
  line-height: 1.7;
  margin: 16px 0 32px;
}
.cert-course strong { color: #080808; }
.cert-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  width: 100%;
  margin-top: auto;
  padding-top: 32px;
  gap: 16px;
}
.cert-footer-item { text-align: center; flex: 1; }
.cert-footer-line {
  width: 140px;
  max-width: 100%;
  height: 1px;
  background: #080808;
  margin: 0 auto 8px;
}
.cert-footer-label {
  font-size: 11px;
  color: #ababab;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 4px;
}
.cert-footer-value {
  font-size: 14px;
  font-weight: 500;
  color: #363636;
  font-family: ui-monospace, monospace;
}
.cert-id {
  font-size: 12px;
  color: #ababab;
  word-break: break-all;
  margin-top: 24px;
  font-family: ui-monospace, monospace;
}
`;
