type BasicButtonProps = {
    click: () => any;
    text: string;
}

export default function BasicButton({click, text}: BasicButtonProps) {
    return (
        <div className="w-auto h-auto px-4 py-2 rounded-md bg-blue-700 hover:bg-blue-500 active:bg-blue-900">
            <button onClick={click}> <p className="text-white"> {text} </p> </button>
        </div>
    )
}