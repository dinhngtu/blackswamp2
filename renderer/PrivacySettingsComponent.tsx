import { useEffect, useState } from "preact/hooks";
import { Fragment } from "preact";
import { PrivacySettingsSection } from "./Article";
import { useLocalStorage } from "./Util";

type PrivacyPermission = "unset" | "loading" | "true" | "false";

export function usePrivacyPermission(name: string): [PrivacyPermission, (value: boolean) => void] {
  const [backValue, setBackValue] = useLocalStorage(`permission-${name}`);
  const [value, setValue] = useState<PrivacyPermission>("loading");
  useEffect(() => {
    if (backValue === null) {
      setValue("unset")
    } else if (backValue === "true") {
      setValue("true")
    } else {
      setValue("false")
    }
  }, [backValue]);
  return [value, (v: boolean) => setBackValue(String(v))];
}

export function usePrivacyPrompt(name: string, displayName: string) {
  const [value, setValue] = usePrivacyPermission(name);
  const prompt = (
    <Fragment>
      <a href="javascript:void(0)" onClick={() => setValue(true)}>Click here</a> to allow the use of {displayName}. You can change your preferences later in the <a href="/articles/privacy.html">Privacy</a> page.
    </Fragment>
  );
  return [value, setValue, prompt];
}

export default function PrivacySettingsComponent(_props: PrivacySettingsSection) {
  const [halPermission, setHALPermission] = usePrivacyPermission("hal");
  const [youtubePermission, setYoutubePermission] = usePrivacyPermission("youtube");

  const updater = (setter: (value: boolean) => void) => {
    return (e: Event) => {
      if (e.target instanceof HTMLInputElement && e.target?.checked != null) {
        setter(e.target.checked);
      }
    }
  };

  const checkbox = (value: PrivacyPermission, setter: (value: boolean) => void, displayName: string) => (
    <label>
      <input
        type="checkbox"
        checked={value === "true"}
        disabled={value === "loading"}
        onChange={updater(setter)} />
      {displayName}
    </label>
  );

  return <>
    <div>
      {checkbox(halPermission, setHALPermission, "HAL Articles API")}
    </div>
    <div>
      {checkbox(youtubePermission, setYoutubePermission, "YouTube")}
    </div>
  </>;
}
