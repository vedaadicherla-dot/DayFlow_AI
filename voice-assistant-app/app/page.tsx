"use client";

import {useEffect,useRef,useState} from "react";
import{
Calendar,
Clock,
Volume2,
Mic,
Moon,
Bot,
CheckCircle,
AlertCircle,
BarChart3
}from"lucide-react";

import CalenderView from "./components/CalendarView";
import Dashboard from "./components/Dashboard";
import MoodCheck from "./components/MoodCheck";


interface Task{

id:string;

task_title:string;

execution_time:string;

priority:
"CRITICAL"|
"HIGH"|
"MEDIUM"|
"LOW";

voice_reminder_text:string;

status:
"PENDING"|
"COMPLETED";

}



export default function Home(){

const [hasPlanned,setHasPlanned]=useState(false);

const[textInput,setTextInput]=useState("");

const[tasks,setTasks]=useState<Task[]>([]);

const[loading,setLoading]=useState(false);

const[listening,setListening]=useState(false);

const[fetching,setFetching]=useState(true);

const[showWelcome,setShowWelcome]=useState(true);

const[mood,setMood]=useState("");

const[isMounted,setIsMounted]=useState(false);



const spokenReminders=
useRef(new Set<string>());


const speechLock=
useRef(false);


const selectedVoice=
useRef<SpeechSynthesisVoice|null>(null);



const loadVoice=()=>{

if(typeof window==="undefined")
return;


const voices=
window.speechSynthesis.getVoices();


selectedVoice.current=

voices.find(v=>
v.name.includes("Microsoft Zira")
)

||

voices.find(v=>
v.name.toLowerCase().includes("female")
)

||

voices.find(v=>
v.lang==="en-US"
)

||

voices[0];

};




const speakAnnouncement=(text:string)=>{


if(typeof window==="undefined")
return;


if(speechLock.current)
return;


speechLock.current=true;


const synth=
window.speechSynthesis;


synth.cancel();


loadVoice();



const utterance=
new SpeechSynthesisUtterance(text);



utterance.voice=
selectedVoice.current;


utterance.rate=0.95;


utterance.pitch=1.1;


utterance.volume=1;



utterance.onend=()=>{

speechLock.current=false;

};


utterance.onerror=()=>{

speechLock.current=false;

};


synth.speak(utterance);


};





const startListening=()=>{


const SpeechRecognition=
(window as any).SpeechRecognition||
(window as any).webkitSpeechRecognition;



if(!SpeechRecognition){

alert("Speech recognition not supported");

return;

}



const recognition=
new SpeechRecognition();



recognition.lang="en-US";



recognition.onstart=()=>{

setListening(true);

};



recognition.onresult=(event:any)=>{


setTextInput(
event.results[0][0].transcript
);


};



recognition.onend=()=>{

setListening(false);

};



recognition.start();



};





const fetchTasks=async()=>{


try{


const res=
await fetch("/api/tasks");


const data=
await res.json();


setTasks(
data.tasks||[]
);



}
catch(error){

console.log(error);

}
finally{

setFetching(false);

}


};
useEffect(()=>{

setIsMounted(true);


setTimeout(()=>{

setShowWelcome(true);


speakAnnouncement(
"Hello!!! I am your smart assistant. What are your plans for today?"
);


},800);



Notification.requestPermission();



},[]);





const handleMood=(value:string)=>{

setMood(value);


speakAnnouncement(
`I see you are feeling ${value}. I will adjust your schedule accordingly.`
);


};





const handlePlanDay=async()=>{


if(!textInput.trim())
return;



setLoading(true);



try{


const res=
await fetch("/api/plan",
{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

rawInput:textInput,

userId:"demo-user-123",

mood:mood

})

});



if(res.ok){

spokenReminders.current.clear();

await fetchTasks();


const taskResponse=await fetch("/api/tasks");

const taskData=await taskResponse.json();


const plannedTasks=taskData.tasks || [];



let scheduleText=
"Your day has been planned successfully. Here is your schedule. ";



plannedTasks.forEach((task:any,index:number)=>{


const time =
new Date(task.execution_time)
.toLocaleTimeString(
"en-US",
{
hour:"numeric",
minute:"2-digit",
hour12:true
}
);



scheduleText +=
`At ${time}, you have to ${task.task_title}. `;


});



speakAnnouncement(scheduleText);


}


}

catch(error){

console.log(error);

}

finally{

setLoading(false);

}


};






const planTomorrow=()=>{


setTextInput(
"Plan my schedule for tomorrow including important work, breaks and deadlines."
);


speakAnnouncement(
"Tell me your plans for tomorrow."
);


};






const completeTask=async(id:string)=>{


try{


await fetch("/api/complete",
{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

id:id

})

});



await fetchTasks();


speakAnnouncement(
"Great job. Task completed."
);


}

catch(error){

console.log(error);

}


};






const rescheduleTask=async(id:string)=>{


try{


await fetch("/api/reschedule",
{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

taskId:id

})

});



await fetchTasks();



speakAnnouncement(
"I have adjusted your missed task and created a new schedule."
);


}

catch(error){

console.log(error);

}


};






useEffect(()=>{


if(tasks.length===0)
return;



const interval=
setInterval(()=>{


const now=
new Date();



tasks.forEach(task=>{


if(task.status==="COMPLETED")
return;



const taskTime=
new Date(task.execution_time);



const difference=
Math.floor(
(taskTime.getTime()-now.getTime())
/60000
);




if(
difference===10 &&
!spokenReminders.current.has(
task.id+"10"
)

){


spokenReminders.current.add(
task.id+"10"
);


speakAnnouncement(
`${task.task_title} is scheduled after 10 minutes`
);


}




if(
difference<0 &&
!spokenReminders.current.has(
task.id+"missed"
)

){


spokenReminders.current.add(
task.id+"missed"
);


speakAnnouncement(
`You missed ${task.task_title}. I can reschedule it for you.`
);


}


});


},10000);



return()=>clearInterval(interval);



},[tasks]);






const getPriorityColor=(priority:string)=>{


switch(priority){


case"CRITICAL":

return"bg-red-100 text-red-700";


case"HIGH":

return"bg-orange-100 text-orange-700";


case"MEDIUM":

return"bg-blue-100 text-blue-700";


default:

return"bg-gray-100 text-gray-700";


}


};






const formatTime=(time:string)=>{


if(!isMounted)
return"";


return new Date(time)
.toLocaleTimeString(
[],
{
hour:"2-digit",
minute:"2-digit"
}
);


};
return(

<main className="min-h-screen bg-slate-50 p-6 max-w-6xl mx-auto space-y-8">


{
showWelcome&&

<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

<div className="bg-white rounded-3xl p-8 w-96 text-center shadow-xl">


<Bot className="mx-auto text-indigo-600 w-14 h-14"/>


<h2 className="text-2xl font-bold mt-4">

Hello 👋

</h2>


<p className="text-gray-600 mt-3">

What are your plans for today?

</p>


<button

onClick={()=>setShowWelcome(false)}

className="mt-6 bg-indigo-600 text-white px-6 py-3 rounded-xl"

>

Start Planning

</button>


</div>

</div>

}




<header className="border-b pb-5">


<h1 className="text-3xl font-extrabold flex items-center gap-3">

<Calendar className="text-indigo-600"/>

Daily Smart Assistant

</h1>


<p className="text-gray-500">

AI planner with voice, calendar and productivity tracking

</p>


</header>

<MoodCheck
onSelect={handleMood}
/>

<section className="bg-white p-6 rounded-2xl shadow space-y-4">


<h2 className="font-bold text-lg">

Plan Your Day

</h2>



<textarea

rows={4}

value={textInput}

onChange={
e=>setTextInput(e.target.value)
}

placeholder="Tell me your plans..."

className="w-full border rounded-xl p-4 outline-none focus:ring-2 focus:ring-indigo-500"

/>





<div className="flex flex-wrap gap-3">



<button

onClick={startListening}

className="bg-purple-600 text-white px-5 py-3 rounded-xl flex gap-2 items-center"

>

<Mic/>

{

listening?

"Listening..."

:

"Speak"

}

</button>






<button

onClick={planTomorrow}

className="bg-slate-800 text-white px-5 py-3 rounded-xl flex gap-2 items-center"

>

<Moon/>

Tomorrow

</button>






<button

onClick={handlePlanDay}

disabled={loading}

className="bg-indigo-600 text-white px-6 py-3 rounded-xl"

>


{

loading?

"🤖 Planning your day..."

:

"Plan My Day"

}


</button>


</div>


</section>
{

hasPlanned &&

<>

<Dashboard
tasks={tasks}
/>


<CalenderView
tasks={tasks}
/>

</>

}

<section>


<h2 className="text-xl font-bold flex items-center gap-2">

<Clock/>

Today's Timeline

</h2>





{

fetching?

<p className="mt-5 text-gray-500">

Loading your schedule...

</p>


:


tasks.length===0?


<div className="bg-white rounded-xl p-10 mt-5 text-center border">


<AlertCircle className="mx-auto text-gray-400"/>


<p className="mt-3 text-gray-500">

Your AI assistant is ready.

Tell me your plans and I will organize your personalized day.

</p>


</div>



:


<div className="space-y-4 mt-5">



{

tasks.map(task=>(


<div

key={task.id}

className="bg-white p-5 rounded-2xl shadow border flex justify-between items-center"

>


<div className="space-y-2">


<span

className={`px-3 py-1 rounded-full text-xs font-bold ${getPriorityColor(task.priority)}`}

>

{task.priority}

</span>




<h3 className="text-lg font-bold">

{task.task_title}

</h3>




<p className="text-gray-600">

⏰ {formatTime(task.execution_time)}

</p>



<p className="italic text-gray-500">

🗣️ {task.voice_reminder_text}

</p>





<div className="flex gap-3 mt-3">


<button

onClick={()=>completeTask(task.id)}

className="bg-green-600 text-white px-4 py-2 rounded-xl flex gap-2 items-center"

>

<CheckCircle/>

Complete

</button>





<button

onClick={()=>rescheduleTask(task.id)}

className="bg-orange-500 text-white px-4 py-2 rounded-xl"

>

🔄 Reschedule

</button>


</div>


</div>






<button

onClick={()=>speakAnnouncement(task.voice_reminder_text)}

className="p-3 rounded-xl bg-indigo-50 text-indigo-600"

>

<Volume2/>

</button>



</div>


))

}


</div>


}


</section>



</main>

);

}