// Always visible (sticky footer). Wording from CLAUDE.md section 7.
export default function Disclaimer() {
  return (
    <footer className="disclaimer" role="contentinfo">
      Educational project. Not an official flood warning service and not safety advice.
      Check the Environment Agency for official information.
    </footer>
  );
}
