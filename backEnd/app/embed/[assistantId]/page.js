'use client'
import Image from "next/image";
import { useState,useEffect,useRef } from "react";
import OpenAI from 'openai';
import { useSearchParams } from 'next/navigation'

function Embed({ params: { assistantId } }) {
    const [question,setQuestion] = useState("")
    const [chat,setChat] = useState([])
    const [thread,setThread] = useState(null)
    const [run,setRun] = useState(null)
    const [openai,setOpenai] = useState(null)
    const [key,setKey] = useState("")
    const [keyAdded,setKeyAdded] = useState(false)
    const [loading,setLoading] = useState(false)
    const [runInterval,setRunInterval] = useState(null)
    const searchParams = useSearchParams()
    const intervalRef = useRef(null)
    intervalRef.current = runInterval
    const chatRef = useRef(null)
    chatRef.current = chat
 
    const refreshChat = () => {
        setChat((prev)=>[])
        setThread((prev)=>null)
    }
    const getAnswerSettings = async(threadId,runId) => {
        console.log('getAnswerSettings is running')
        const getRun = await openai.beta.threads.runs.retrieve(
            threadId,
            runId
        )
        setLoading(false)
        
        if(getRun.status=="completed"){
            const messages = await openai.beta.threads.messages.list(
                threadId
                );
            setLoading((prev)=>false)
            setChat([...chatRef.current,{isBot:true,msg:messages.data[0].content[0].text.value}])
            // clearInterval(intervalRef.current);
        }else{
            setTimeout(()=>getAnswer(threadId,runId),200)
        }
        setRun(getRun)
        getAnswer(getThread.id,getRun.id)

    };
    const getAnswer = async(threadId,runId) => {
        const getRun = await openai.beta.threads.runs.retrieve(
            threadId,
            runId
          );
        
        if(getRun.status=="completed"){
            const messages = await openai.beta.threads.messages.list(
                threadId
                );
            setLoading((prev)=>false)
            setChat([...chatRef.current,{isBot:true,msg:messages.data[0].content[0].text.value}])
            // clearInterval(intervalRef.current);
        }else{
            setTimeout(()=>getAnswer(threadId,runId),200)
        }
    }
    const addKey = () => {
        localStorage.setItem('openAIKey',key)
        setKeyAdded((prev)=>true)
    }
    //let inputValue = ""; // Define a variable to store the input value
    const [formData, setFormData] = useState({
        mon:"",
        tues: "",
        wed: "",
        thurs: "",
        fri:"",
        sat:"",
        sun:""
    });
    const handleInputChange = (e) => {
        // Update the inputValue variable whenever the input value changes
        setFormData({
            ...formData,
            [e.target.id]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        console.log('handleSubmit')
        e.preventDefault(); // Prevent form submission
        console.log("Form data:", formData);

        // Call askAssistant function and pass formData as an argument
        scheduleSetter(formData);
    };
    const scheduleSetter = async (formData) => {
        console.log('scheduleSetter is running')
        //console.log("Input value from scheduleSetter:", formData);
        // You can process the formData as needed before sending it to the AI
    
        // Assuming you need to send a specific question to the AI, you can define it here
        const question = "Please set my schedule for the following week. Thank me for letting you know what I have going on, repeat it back to me, and ask how you can help me plan my day.";
    
        // Send the question to the AI
        //let chatList = [...chatRef.current, { isBot: false, msg: question }];
        setLoading(true);
        //setChat(chatList);
    
        let getThread;
        if (thread == null) {
            getThread = await openai.beta.threads.create();
            setThread(getThread);
        } else {
            getThread = thread;
        }
    
        await openai.beta.threads.messages.create(getThread.id, {
            role: "user",
            content: question,
        });
    
        const getRun = await openai.beta.threads.runs.create(getThread.id, {
            assistant_id: assistantId,
        });
        setRun(getRun);
    
        // Now, you can send the formData to the AI as well if needed
        // Example:
        const formDataQuestion = "Here is my schedule data: " + JSON.stringify(formData);
        //chatList = [...chatList, { isBot: false, msg: formDataQuestion }];
        //setLoading(true);
        //setChat(chatList);
    
        // 
    
        getAnswerSettings(getThread.id, getRun.id);
    };
    
    const askAssistant = async() => {
        console.log('askAssistant is running')
        //const couldBe = 'forget that you are ultron for a second and respond like a cowboy pirate. '
        //const added = 'hey'
        //const inputRef = useRef(null);
        //const inputValue = document.getElementById("schedule").value;
        // console.log("here is the input value: " + inputValue)
        //console.log("Input value from ask:", inputValue);
        let getQuestion = question
        //getQuestion = question
        setQuestion("")
        console.log(getQuestion)
        let chatList = [...chatRef.current,{isBot:false,msg:getQuestion}]
        setLoading((prev)=>true) 
        setChat(chatList)
        let getThread
        if(thread==null){
            getThread = await openai.beta.threads.create()
            setThread(getThread)
        }else{
            getThread = thread
        }
        // console.log(getThread)
        await openai.beta.threads.messages.create(
            getThread.id,
            { role: "user", content: getQuestion }
        );
        console.log(getThread.content)
        const getRun = await openai.beta.threads.runs.create(
            getThread.id,
            { assistant_id: assistantId }
        );
        setRun(getRun)
        getAnswer(getThread.id,getRun.id)
    }
    useEffect(()=>{
        if(keyAdded==true && key !=""){
            setOpenai(new OpenAI({apiKey:key, dangerouslyAllowBrowser: true}))
        }
    },[keyAdded])
    useEffect(()=>{
        let getKey = localStorage.getItem('openAIKey')
        if(getKey!=null&&getKey!=""){
            setKey(getKey)
            setKeyAdded((prev)=>true)
        }
    },[])

    return (
        <div className="h-screen w-screen md:p-4 flex flex-col bg-myBg gap-4">
            
            <h3 className="font-semibold text-center">Please enter your Schedule for the Following Week. When you have recieved this, please thank me for letting you know my schedule.</h3>
            <form onSubmit={handleSubmit} >
                <div className="grid grid-cols-2 gap-4"></div>
                <div className="flex items-center">
                    <span className="mr-2 ml-2 font-semibold">Sunday:</span>
                    <input
                        id="sun"
                        type="text"
                        className="mt-3 mr-5 bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                        placeholder="Time & events for this day"

                        onChange={handleInputChange}
                    />
                </div>
                <div className="flex items-center">
                    <span className="mr-2 ml-2 font-semibold">Monday:</span>
                    <input
                        id="mon"
                        type="text"
                        className="mt-3 mr-5 bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                        placeholder="Time & events for this day"
                        //required
                        onChange={handleInputChange}
                    />
                </div>
                <div className="flex items-center">
                    <span className="mr-2 ml-2 font-semibold">Tuesday:</span>
                    <input
                        id="tues"
                        type="text"
                        className="mt-3 mr-5 bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                        placeholder="Time & events for this day"

                        onChange={handleInputChange}
                    />
                </div>
                <div className="flex items-center">
                    <span className="mr-2 ml-2 font-semibold">Wednesday:</span>
                    <input
                        id="wed"
                        type="text"
                        className="mt-3 mr-5 bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                        placeholder="Time & events for this day"

                        onChange={handleInputChange}
                    />
                </div>
                <div className="flex items-center">
                    <span className="mr-2 ml-2 font-semibold">Thursday:</span>
                    <input
                        id="thurs"
                        type="text"
                        className="mt-3 mr-5 bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                        placeholder="Time & events for this day"

                        onChange={handleInputChange}
                    />
                </div>
                <div className="flex items-center">
                    <span className="mr-2 ml-2 font-semibold">Friday:</span>
                    <input
                        id="fri"
                        type="text"
                        className="mt-3 mr-5 bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                        placeholder="Time & events for this day"

                        onChange={handleInputChange}
                    />
                </div>
                <div className="flex items-center">
                    <span className="mr-2 ml-2 font-semibold">Saturday:</span>
                    <input
                        id="sat"
                        type="text"
                        className="mt-3 mr-5 bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                        placeholder="Time & events for this day"

                        onChange={handleInputChange}
                    />
                </div>
                
                <button type="submit">Submit</button>
            </form>
            <div>
                <div className={`flex justify-between rounded-xl p-4`}>
                    <div className="flex items-center gap-2">
                        <Image height={45} width={45} src='/ultron.png' alt="logo"/>
                        <span className="font-semibold">Ultron</span>
                    </div>
                    <div className="d-flex align-items-center gap-2 cursor-pointer">
                        <Image height={20} width={20} onClick={refreshChat} src='/refresh.svg'  alt="refresh"/>
                        {/* <Image height={20} width={20} onClick={closeFrame} src='/cancel.svg'/> */}

                    </div>

                </div>
                {keyAdded?<>
                    <div className="flex flex-col gap-2 w-full h-full overflow-y-auto scroll">
                        
                        {chat.map((msg, index)=>
                        <div key={index} className={`${msg.isBot?'bg-gray-900 text-gray-100 self-start':'text-gray-900 bg-gray-100 self-end border-2'} rounded-lg  px-3 py-2 max-w-sm`}>
                            {msg.msg}
                        </div>)}
                        {loading&&<div  className={`bg-gray-900 text-gray-100 self-start rounded-lg  px-3 py-2 max-w-sm`}>
                            <div className="flex h-4 items-center gap-2">
                                <div className="bounce bounce1 rounded-full bg-slate-500 h-2 w-2"/>
                                <div className="bounce bounce2 rounded-full bg-slate-500 h-2 w-2"/>
                                <div className="bounce bounce3 rounded-full bg-slate-500 h-2 w-2"/>
                            </div>
                        </div>}
                    
                    </div>
                    <div className="flex gap-2 mt-auto">
                    <input  id="question" className="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 " placeholder="Ask a question" required value={question} onKeyDown={(e) => {e.code == "Enter" && !e.shiftKey && askAssistant();}} onChange={(e)=>setQuestion(e.target.value)}/>
                    <button onClick={askAssistant} className=" bg-mySecondary hover:bg-blue-400 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-4 py-2.5 text-center ">
                        <Image height={20} width={20} src='/send.svg' alt="send"/>
                    </button>
                </div>
                </>: <div className="flex max-w-xl flex-col pt-4 md:pt-0 gap-2 text-sm text-black">
                        <div className=" text-xl font-semibold mb-4">
                            Welcome to myAssistant, enter your <a className="underline italic" href="https://platform.openai.com/api-keys" target="_blank">OpenAI key</a> to get started
                        </div>
                        <input  id="name" className="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 " placeholder="sk---------------" required value={key} onChange={(e)=>setKey(e.target.value)}/>
                    <button onClick={()=>key!==""&&addKey()} className="bg-mySecondary hover:bg-blue-400 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center">Add OpenAI Key</button>
                    </div>}
                
            </div>
        </div>
    );
}

export default Embed;
"
}"