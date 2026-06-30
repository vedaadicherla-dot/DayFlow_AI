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


const {taskId}=await req.json();



if(!taskId){

return NextResponse.json(
{
error:"Task id required"
},
{
status:400
}
);

}



const {data:task,error}=await supabase

.from("planned_tasks")

.select("*")

.eq("id",taskId)

.single();



if(error)
throw error;



const ai=
await groq.chat.completions.create({

model:"llama-3.3-70b-versatile",

response_format:{
type:"json_object"
},


messages:[

{

role:"system",

content:`

You are an AI rescheduling assistant.

The user missed a task.

Suggest a new realistic time.

Return JSON only.


Format:

{
"time":"HH:MM",
"voice":"friendly reminder"
}

`

},


{

role:"user",

content:`

Task:
${task.task_title}

Previous time:
${task.execution_time}

Priority:
${task.priority}

`

}

]


});




const result=
JSON.parse(
ai.choices[0].message.content||"{}"
);



let hour=18;
let minute=0;



if(result.time){


const split=result.time.split(":");


hour=parseInt(split[0]);

minute=parseInt(split[1]);


}



const newDate=new Date();


newDate.setHours(
hour,
minute,
0,
0
);





const {data:update,error:updateError}=

await supabase

.from("planned_tasks")

.update({

execution_time:newDate.toISOString(),

status:"PENDING",

voice_reminder_text:
result.voice||

`Please complete ${task.task_title}`

})

.eq(
"id",
taskId
)

.select()

.single();





if(updateError)
throw updateError;




return NextResponse.json({

success:true,

task:update

});



}

catch(error:any){


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