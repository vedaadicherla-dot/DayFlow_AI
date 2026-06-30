"use client";

import {useState} from "react";


const moods=[
{
name:"Great",
emoji:"😊",
message:
"That's wonderful! Keep this positive energy going. Celebrate your progress today and continue doing amazing things!"
},
{
name:"Good",
emoji:"🙂",
message:
"Glad to hear that! Keep moving forward step by step. Small actions today will create great results tomorrow."
},
{
name:"Okay",
emoji:"😐",
message:
"It's okay to have normal days. Take a small break, refresh yourself, and focus on one thing at a time. You are doing well."
},
{
name:"Stressed",
emoji:"😟",
message:
"I understand things feel overwhelming right now. Take a deep breath, relax for a moment, and remember that you can handle this one step at a time."
}
];


export default function MoodCheck(){


const[selected,setSelected]=useState<string|null>(null);


const currentMood=
moods.find(
(mood)=>mood.name===selected
);



return(

<div className="bg-white rounded-2xl shadow p-6">


<h2 className="text-xl font-bold mb-4">

How are your plans for today?

</h2>


<div className="grid grid-cols-2 gap-3">


{
moods.map(
(mood)=>(


<button

key={mood.name}

onClick={()=>setSelected(mood.name)}

className="border rounded-xl p-4 hover:bg-indigo-50 transition"

>


<div className="text-3xl">

{mood.emoji}

</div>


<div className="font-semibold">

{mood.name}

</div>


</button>


)

)
}


</div>




{
currentMood &&

<div className="mt-5 bg-indigo-50 rounded-xl p-4">


<p className="font-semibold">

{currentMood.message}

</p>


</div>

}



</div>

);

}