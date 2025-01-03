import { usePrivacyLink } from "./PrivacySettingsComponent";

export interface ToolbarProps {
  showUnlock?: boolean,
  onUnlock?: (password: string) => void,
  permalink?: string,
};

export default function ToolbarComponent(props: ToolbarProps) {
  const unlock = () => {
    if (!props.onUnlock) {
      return;
    }
    const password = window.prompt("Enter secret:");
    if (!password) {
      return;
    }
    props.onUnlock(password);
  };

  return <>
    <a href="/">Home</a>
    {props.showUnlock && <a href="javascript:void(0)" onClick={unlock}>Unlock</a>}
    {props.permalink && <a href={props.permalink.toString()}>Permalink</a>}
    {usePrivacyLink()}
  </>
}
