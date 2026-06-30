import {NextResponse} from "next/server";
import {createClient} from "@supabase/supabase-js";
import OpenAI from "openai";


const supabase=createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.SUPABASE_SERVICE_ROLE_KEY!
);



const groq=new OpenAI({

apiKey:process.env.GROQ_API_KEY!,

baseURL:"https://api.groq.com/openai/v1"

});



export async function POST(req:Request){

try{


const{
rawInput,
userId,
mood
}=await req.json();



if(!rawInput||!userId){

return NextResponse.json(
{
error:"Missing input"
},
{
status:400
}
);

}





const{
data:planData,
error:planError
}=await supabase
.from("user_plans")
.insert([
{
user_id:userId,
raw_input:rawInput
}
])
.select()
.single();



if(planError)
throw planError;






const completion=
await groq.chat.completions.create({

model:"llama-3.3-70b-versatile",


response_format:{
type:"json_object"
},


messages:[

{

role:"system",

content:`

You are an AI personal assistant.

Create a realistic daily schedule.


User mood:
${mood||"normal"}


Priority rules:

CRITICAL:
Emergency, health, urgent deadlines.

HIGH:
Important work, exams, meetings.

MEDIUM:
Regular responsibilities.

LOW:
Optional activities.


Generate:

1. Task title
2. Exact time
3. Priority
4. Friendly female voice reminder


Return only JSON.


Format:

{
"tasks":[
{
"task_title":"",
"time_string":"HH:MM",
"priority":"",
"voice_reminder_text":""
}
]
}

`

},


{

role:"user",

content:rawInput

}


]

});





const result=
JSON.parse(
completion.choices[0].message.content||"{}"
);



const tasks=result.tasks||[];





const formattedTasks=
tasks.map((task:any)=>{


let hour=12;

let minute=0;



if(task.time_string){


const time=
task.time_string.split(":");


hour=parseInt(time[0]);

minute=parseInt(time[1]);

}



const date=new Date();


date.setHours(
hour,
minute,
0,
0
);



return{

plan_id:planData.id,

user_id:userId,

task_title:
task.task_title||"Task",


execution_time:
date.toISOString(),


priority:
task.priority||"MEDIUM",


voice_reminder_text:
task.voice_reminder_text||
`It is time for ${task.task_title}`,


status:"PENDING"

};


});






if(formattedTasks.length>0){


const{
error
}=await supabase
.from("planned_tasks")
.insert(formattedTasks);



if(error)
throw error;


}






return NextResponse.json({

success:true,

count:formattedTasks.length

});


}


catch(error:any){


console.log(error);


return NextResponse.json(

{
error:error.message
},

{
status:500
}

);


}


}