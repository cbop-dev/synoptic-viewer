<script>
import { mylog } from '$lib/env/env';
import Chart from 'chart.js/auto';

/** 
 * @typedef Props
 * @property {{ labels: string[], nums: number[]}} pieData
 * @property {string} title
 * @property {function} onclick
 * 
*/
/**
 * @type {Props}
 */
let {   
    pieData={labels:[], nums:[]},
    title="",
     onclick=(items)=>{},
} = $props();



let type = 'pie';


function defaultData() {
    return {
        labels: ['Section','Rest of NT'],
        datasets: [{
            data: [50, 300],
            backgroundColor: [
            'rgb(255, 99, 132)',
            'rgb(255, 205, 86)'
            ],
            hoverOffset: 30
        }]
    }
}

let data = $derived.by(()=>{
    const theData = defaultData();
    if (pieData.labels && pieData.labels.length){
        theData.labels  =[];
        
        pieData.labels.forEach((l)=>{
            theData.labels.push(l);
            
        })
    }

    if (pieData.nums.length){
        theData.datasets[0].data=[]
        mylog("building pie data with [" + pieData.nums.join(',') + ']')
        pieData.nums.forEach((n)=>{
            theData.datasets[0].data.push(n)
            
        })
        if (pieData.nums.length > 2){
            theData.datasets[0].backgroundColor= [...Array(pieData.nums.length)].map((val,i)=> //"hsl(56, 80%, 50%)");
                 "hsl(" + Math.round(300 * i/(pieData.nums.length-1)).toString()  +", 80%, 50%)"
            );
               
            
            mylog("got pie colors: [" + theData.datasets[0].backgroundColor.join(',') + "]");
        }
    }
            
    return theData;
})
let options = $state({
    plugins: {
        legend: {display: false},
    }
});
	
let config = $derived({
		type,
		data: data,
        options
		
});

let theChart = null;
function handleChart(element, config) {
    //mylog("handling bubble chart...")
		theChart = new Chart(element, config)
		
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