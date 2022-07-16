import { useEffect, useState } from "preact/hooks";
import { Fragment } from "preact";
import { PrivacySetting, PrivacySettingsSection } from "./Article";
import { useLocalStorage } from "./Util";

type PrivacyPermission = "unset" | "loading" | "true" | "false";

export function usePrivacyPermission(setting: PrivacySetting): [PrivacyPermission, (value: boolean) => void, string] {
  const [backValue, setBackValue] = useLocalStorage(`permission-${setting.Name}`);
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
  return [value, (v: boolean) => setBackValue(String(v)), setting.DisplayName];
}

export function usePrivacyPrompt(setting: PrivacySetting) {
  const [value, setValue] = usePrivacyPermission(setting);
  const prompt = (
    <Fragment>
      <a href="javascript:void(0)" onClick={() => setValue(true)}>Click here</a> to allow the use of {setting.DisplayName}. You can change your preferences later in the <a href="/articles/privacy.html">Privacy</a> page.
    </Fragment>
  );
  return [value, setValue, prompt];
}

export default function PrivacySettingsComponent(props: PrivacySettingsSection) {
  const perms = props.PrivacySettings.map(setting => usePrivacyPermission(setting));

  const updater = (setter: (value: boolean) => void) => {
    return (e: Event) => {
      if (e.target instanceof HTMLInputElement && e.target?.checked != null) {
        setter(e.target.checked);
      }
    }
  };

  const checkbox = (value: PrivacyPermission, setter: (value: boolean) => void, displayName: string) => (
    <div>
      <label>
        <input
          type="checkbox"
          checked={value === "true"}
          disabled={value === "loading"}
          onChange={updater(setter)} />
        {displayName}
      </label>
    </div>
  );

  return <>
    {perms.map(p => checkbox(...p))}
  </>;
}
