import { useState } from "react";

type ValueChangerProps = {
    target: {value: any, min: number, max: number}
    name: string;
    resetTarget: [{value: any}, number];
}

export default function ValueChanger({ target, name, resetTarget }: ValueChangerProps) {
    const [value, setValue] = useState<string>("");
    const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        let temp = Number(value);
        if (!Number.isNaN(temp)) {
            if (temp >= target.min && temp <= target.max) {
                target.value = Number(value);
            }
        }
    }
    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setValue(event.target.value);
      };
    const reset = () => {
        resetTarget[0].value = resetTarget[1];
    }
    return (
        <>  
            <form onSubmit={onSubmit}>
                <div className="flex flex-col gap-1 items-center justify-center">
                    <strong> {name} </strong>
                    <input className="border-black focus:border-green-600 focus:outline-none border-2 rounded-md" type="text" onChange={onChange}></input>
                    <button className="bg-green-600 hover:bg-green-400 active:bg-green-800 px-4 py-2 w-auto h-auto rounded-md text-white" type="submit"> Submit </button>
                    <button className="bg-red-600 hover:bg-red-400 active:bg-red-800 px-4 py-2 w-auto h-auto rounded-md text-white" type="button" onClick={reset}> Reset to Default </button>
                </div>
            </form>
        </>
    )
}