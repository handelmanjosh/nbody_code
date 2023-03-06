import { useState } from "react";

type CheckBoxProps = {
    onChecked: () => any;
    text: string;
}

export default function CheckBox({ onChecked, text }: CheckBoxProps) {
    const [checked, setChecked] = useState<boolean>(false);
    const check = () => {
        setChecked(!checked);
        onChecked();
    }
    return (
        <div className={`flex flex-row items-center gap-2 justify-center w-auto h-auto py-2 px-4 rounded-md ${checked ? "bg-green-600" : "bg-red-600"}`}>
            <input type="checkbox" onChange={check} />
            <p className={"text-white"}> {text} </p>
        </div>
    )
}