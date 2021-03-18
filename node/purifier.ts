import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";

const { window } = new JSDOM();
const purifier = DOMPurify(window as unknown as Window);
export default purifier;
