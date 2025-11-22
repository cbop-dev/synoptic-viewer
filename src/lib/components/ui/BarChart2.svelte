<script>
import { mylog } from '$lib/env/env';
import Chart from 'chart.js/auto';
import { generateHslColorGradient } from "$lib/components/ui/chartUtils.js";

/** 
 *  
 * 
*/
let {   
    barData={labels:[], nums:[]},
    horizontal=false,
    title="",
     onclick=(items)=>{},
     animation=false
} = $props();



let type = 'bar';


function defaultData() {
    return {
        labels: ['Book freq.','NT freq.'],
        datasets: [{
            data: [1, 2],
            backgroundColor: [
            'rgb(255, 99, 132)',
            'rgb(255, 205, 86)'
            ],
            hoverOffset: 10
        }]
    }
}


    const theData = defaultData();
    if (barData.labels && barData.labels.length){
        theData.labels  =[];
        
        barData.labels.forEach((l)=>{
            theData.labels.push(l);
            
        })
    }

    if (barData.nums.length){
        theData.datasets[0].data=[]
        mylog("building bar data with [" + barData.nums.join(',') + ']')
        barData.nums.forEach((n)=>{
            theData.datasets[0].data.push(n)
            
        })
    }
    if (barData.nums.length > 2){
        theData.datasets[0].backgroundColor = generateHslColorGradient(barData.nums.length);
    }
    const data = theData;

let options ={
    plugins: {
        legend: {display: false},
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
};

if (horizontal){
    options.indexAxis="y";
}

if(!animation){
    options.animation=false;
}
let config = {
		type,
		data: data,
        options
		
};

let theChart = null;
function handleChart(element, config) {
    //mylog("handling bubble chart...")
		theChart = new Chart(element, config);
		
		return {
			update(config) {
				theChart.destroy()
				theChart = new Chart(element, config)
			},
			destroy() {
				theChart.destroy()
			}
		}
}
</script>
{#if title}
<h3>{title}</h3>
{/if}
<canvas use:handleChart={config}></canvas>