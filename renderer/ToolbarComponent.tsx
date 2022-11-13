import { usePrivacyLink } from "./PrivacySettingsComponent";

export interface ToolbarOptions {
  showUnlock?: boolean,
  permalink?: string,
};

export type ToolbarProps = ToolbarOptions & {
  onUnlock?: (password: string) => void,
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
    {props.showUnlock && <a href="javascript:void(0)" onClick={unlock}>Unlock</a>}
    {props.permalink && <a href={props.permalink.toString()}>Permalink</a>}
    {usePrivacyLink()}
  </>
}
