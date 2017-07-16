//yggdrasil.js
function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
}

function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    ev.target.appendChild(document.getElementById(data));
}

function getProjects() {
	var projects = 
[{
  id="1",
  title: "Personal Finance Manager",
  description: "Windows Desktop Application C# Winforms application (csv import, store in local sql server, autocategorization and charting)",
  year: "2017",
  pdfUrl: "/personalSpendingAnalysis/personalSpendingAnalysis.pdf",
  url:  "/personalSpendingAnalysis/personalSpendingAnalysis.html",
  codeUrl: "https://gitlab.com/hipparchus2000/PersonalSpendingAnalysis"
},
{
  id="2",
  title: "PayItForward Awesome Badge",
  description: "example of a simple link on a website so you can buy something through Paypal",
  year: "2016",
  siteUrl:"/badge/www.payitforwardawesomebadge.com/index.html"
},
{
  id="3",
  title:"7Habits",
  description: "Meteor (node + mongodb) web application to Manage your life using Stephen Covey's 7 habits of successful people.",
  year: "2016",
  siteUrl: "http://www.talkisbetter.com:3000/",
  codeUrl: "https://gitlab.com/hipparchus2000/mividaloca" 
},
{
  id="4",
  title: "BioReactorController",
  description: "Android Java simulator (unfinished) with C microcontroller program.",
  year: "2013",
  codeUrl: "https://gitlab.com/hipparchus2000/BioReactorController"
},
{
  id="5",
  title: "Sockmin",
  description: "Very fast c# webapi and websockets website implementation. No front end framework used, simple websocket listener in javascript inserts data direct into DOM.",
  year: "2017",
  codeUrl: "https://gitlab.com/hipparchus2000/SockMin.git"
},
{
  id="6",
  title: "F00",
  description: "16 bit CPU design (in ABEL) With Assembler and Simulator written in C.",
  year: "2002",
  codeUrl: "https://gitlab.com/hipparchus2000/f00"
},
{
  id="7",
  title: "DistributedAverageConsensus",
  description: "C# websockets solution to Distributed Average Consensus problem (how to generate average or other math solutions for massive geographically distributed datasets).",
  year: "2017",
  codeUrl: "https://gitlab.com/hipparchus2000/DistributedAverageConsensus"
},
{
  id="8",
  title: "TrueCrypt",
  description: "C++ One Time Pad plus additional hardening implementation.",
  year: "2002",
  codeUrl: "https://gitlab.com/hipparchus2000/TrueCrypt"
}
];

return projects;
}


var templates = document.getElementById("templates");
if(templates!=null) {
	var cardrowTemplate = templates.getElementById("card-row");
	var cardTemplate = templates.getElementById("card");
	var projects = getProjects();
}


