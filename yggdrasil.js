//yggdrasil.js

var route="/";
var breadcrumbs=["/"];

var projectsUrl = "/api/projects";
var blogsUrl = "/api/blogs";
var authUrl = "/api/auth";

function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
}

function addButton() {
	//alert("addButton");
	route = route+"/add";
	refresh();
}

function editButton(id) {
	//alert("editButton"+id);
	var id=id;
	route = route+"/edit";
	refresh();
}

function deleteButton(id) {
	var r = confirm("Are you sure you want to delete this?");
	var txt="";
	if (r == true) {
		txt = "You pressed OK!";
	} else {
		txt = "You pressed Cancel!";
	}
	alert(txt);
	refresh();
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


function registerServiceWorker () {
	//register the service worker
	if ('serviceWorker' in navigator) {
	  window.addEventListener('load', function() {
		navigator.serviceWorker.register('sw.js').then(function(registration) {
		  // Registration was successful
		  console.log('ServiceWorker registration successful with scope: ', registration.scope);
		}).catch(function(err) {
		  // registration failed :(
		  console.log('ServiceWorker registration failed: ', err);
		});
	  });
	}
}

function generateUUID(){
    var d = new Date().getTime();
    if(window.performance && typeof window.performance.now === "function"){
        d += performance.now(); //use high-precision timer if available
    }
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
}


function getUrlUsingRest(url, callback) {
	fetch(url).then(function(response) {
	  	return response.json();
	}).then(function(data) {
		rewriteUrlFromRoute();	
		callback(data);
	}).catch(function(err) {
	  	console.log("Failed To Get Url "+err);
	});
}

function getUrlAsHtmlUsingRest(url, callback) {
	fetch(url, { mode: 'no-cors' }).then(function(response) {
		return response;
	}).then(function(data) {
		rewriteUrlFromRoute();	
		callback(data.text());
	}).catch(function(err) {
		console.log("Failed To Get Url "+err);
	});
}

function loadHtmlFragmentToRoot(url) {
	getUrlAsHtmlUsingRest(url,function(blobCallback) {
		var root = document.getElementById("root");
		//clear all nodes from root
		while (root.firstChild) {
			root.removeChild(root.firstChild);
		};
		blobCallback.then(function(blob) {
			root.innerHTML = blob;
		});
	});
}

function updateField(node, name,value) {
	node.innerHTML = node.innerHTML.replace(/{{name}}/g, value);
}

function applyProjectsTemplate() {
	var templates = document.getElementById("templates");
	var root = document.getElementById("root");
	//clear all nodes from root
	while (root.firstChild) {
		root.removeChild(root.firstChild);
	}

	var cardrowTemplate = document.getElementById("cardRow-template");
	var cardTemplate = document.getElementById("card-template");
	
	var projects = getUrlUsingRest(projectsUrl,function (response) {
		projects = response;
		
		var rowcount=0;
		var currentRow=null;
		
		projects.forEach(function (project) {
			if ((rowcount % 3) == 0) {
				currentRow = cardrowTemplate.cloneNode(true);
			}
			var node = cardTemplate.cloneNode(true);
			
			//if (project.codeUrl==null)
			
			//node.innerHTML = projectTemplatedInstance.innerHTML.replace(/{{title}}/g, project.title);
			updateField( node, "title", project.title);
			node.innerHTML = node.innerHTML.replace(/{{id}}/g, rowcount);
			node.innerHTML = node.innerHTML.replace(/{{description}}/g, project.description);
			node.innerHTML = node.innerHTML.replace(/{{year}}/g, project.year);
			node.innerHTML = node.innerHTML.replace(/{{codeUrl}}/g, project.codeUrl);
			node.innerHTML = node.innerHTML.replace(/{{siteUrl}}/g, project.siteUrl);
			node.innerHTML = node.innerHTML.replace(/{{url}}/g, project.url);
			node.innerHTML = node.innerHTML.replace(/{{pdfUrl}}/g, project.pdfUrl);
			var editButton="";
			if(jwtToken.roles.includes("project-editor")) {
				editButton='<i class="fa fa-trash  fa-3x pull-right" onclick="deleteButton('+rowcount+')" aria-hidden="true"></i><i class="fa fa-pencil fa-3x pull-right" onclick="editButton('+rowcount+')" aria-hidden="true"></i>';	
			}
			node.innerHTML = node.innerHTML.replace(/{{editButton}}/g, editButton);
			
			//hide buttons with undefined href and onclick   --> first button (0) is used for title, so ignore
			var allButtons = node.getElementsByClassName("btn");
			for (var i = 1; i < allButtons.length; i++) {
				
				var href =allButtons[i].getAttribute("href");
				var onclick = allButtons[i].getAttribute("onclick");
				
				var hrefNotFound = href.includes("undefined");
				var onclickNotFound = onclick==null;
				if (href == "#")
					hrefNotFound = true;
				if(onclick!=null) {
					if (onclick.includes("undefined")) {
						onclickNotFound=true;
					}
				}
				
				if(hrefNotFound && onclickNotFound) {
					var classAttribute = allButtons[i].getAttribute("class");
					allButtons[i].className = classAttribute+" hidden";
				}
			}
			
			currentRow.append(node);
			if ((rowcount % 3) == 0) {
				root.append(currentRow);
			}
			rowcount++;
		});
	});
}

function applyAddProjectTemplate () {}
function applyEditProjectTemplate () {}


function applyTasksTemplate() {
	var templates = document.getElementById("templates");
	var root = document.getElementById("root");
	//clear all nodes from root
	while (root.firstChild) {
		root.removeChild(root.firstChild);
	}

	var kanbanTemplate = document.getElementById("kanban-template");
	var slotTemplate = document.getElementById("kanban-slot-template");
	var cardTemplate = document.getElementById("kanban-task-template");
	var kanbanTemplateInstance = kanbanTemplate.cloneNode(true);
	kanbanTemplateInstance.innerHTML = kanbanTemplateInstance.innerHTML.replace(/kanban-template/g,"kanbanroot");
	root.append(kanbanTemplateInstance); 



	//todo change blog to tasks Url
	var id=0;
	var tasks = getUrlUsingRest(blogsUrl,function (tasks) {
		
		var currentSlot=null;
		
		tasks.forEach(function (task) {
			//todo need to assign tasks to correct slot
			var taskTemplatedInstance = cardTemplate.cloneNode(true);

			taskTemplatedInstance.innerHTML = taskTemplatedInstance.innerHTML.replace(/{{storyText}}/g, task.storyText);
			taskTemplatedInstance.innerHTML = taskTemplatedInstance.innerHTML.replace(/{{storyName}}/g, task.storyName);
			taskTemplatedInstance.innerHTML = taskTemplatedInstance.innerHTML.replace(/{{id}}/g,"task"+id);
				var editButton="";
			if(jwtToken.roles.includes("kanban-editor")) {
				editButton='<i class="fa fa-trash  fa-3x pull-right" onclick="deleteButton('+id+')" aria-hidden="true"></i><i class="fa fa-pencil fa-3x pull-right" onclick="editButton('+id+')" aria-hidden="true"></i>';	
			}
			taskTemplatedInstance.innerHTML = taskTemplatedInstance.innerHTML.replace(/{{editButton}}/g, editButton);
			
			currentSlot = slotTemplate.cloneNode(true);
			currentSlot.id = id;
			currentSlot.innerHTML = currentSlot.innerHTML.replace(/kanban-slot-template/g, "slot"+id);
			currentSlot.innerHTML = currentSlot.innerHTML.replace(/{{cards}}/g,taskTemplatedInstance.innerHTML);
			id++;
			var slots = document.getElementById("kanban-slots");
			slots.appendChild(currentSlot);

		});
		
	});

}

function applyAddTasksTemplate () {}
function applyEditTasksTemplate () {}
function applyEditKanbanSlotsTemplate () {}

function applyBlogTemplate() {
	var templates = document.getElementById("templates");
	var root = document.getElementById("root");
	//clear all nodes from root
	while (root.firstChild) {
		root.removeChild(root.firstChild);
	}

	var blogTemplate = document.getElementById("blog-template");

    var id=0;	
	var projects = getUrlUsingRest(blogsUrl,function (response) {
		blogEntries = response;
		
		blogEntries.forEach(function (story) {
			var blogTemplatedInstance = blogTemplate.cloneNode(true);
			blogTemplatedInstance.innerHTML = blogTemplatedInstance.innerHTML.replace(/{{storyText}}/g, story.storyText);
			blogTemplatedInstance.innerHTML = blogTemplatedInstance.innerHTML.replace(/{{storyName}}/g, story.storyName);
			blogTemplatedInstance.innerHTML = blogTemplatedInstance.innerHTML.replace(/{{date}}/g, story.date);
				var editButton="";
			if(jwtToken.roles.includes("blog-editor")) {
				editButton='<i class="fa fa-trash  fa-3x pull-right" onclick="deleteButton('+id+')" aria-hidden="true"></i><i class="fa fa-pencil fa-3x pull-right" onclick="editButton('+id+')" aria-hidden="true"></i>';	
			}
			blogTemplatedInstance.innerHTML = blogTemplatedInstance.innerHTML.replace(/{{editButton}}/g, editButton);
			root.append(blogTemplatedInstance);
			id++;
		});
	});
}

function applyUsersTemplate () {}
function applyAddUsersTemplate () {}
function applyEditUsersTemplate () {}

function navigateState(stateTitle,templateFunction) {
	var title=document.getElementById("pageTitle");
	title.innerHTML=stateTitle;
	templateFunction();
}

function rewriteUrlFromRoute() {
	var url = window.location.href;
	var parts = url.split("#");
	window.location.replace(parts[0] + "#" + route);
}

function refresh() {

	rewriteUrlFromRoute();	
	
	jwtToken = fetchJwt();
	if (jwtToken==null) {
		jwtToken={ admin: false, username: "Guest", roles: ""};
		storeJwt();
	}
	var addButton = document.getElementById("addButton"); 
	if (jwtToken.roles.includes("blog-editor")||jwtToken.roles.includes("project-editor")||jwtToken.roles.includes("kanban-editor")) {
		addButton.style.display = "block";
	} else {
		addButton.style.display = "none";
	}
	switch(route) {
		
		case "/":     navigateState("Yggsrasil Projects", applyProjectsTemplate ); break;
		case "/project/add": navigateState("Add Project", applyAddProjectTemplate); break;
		case "/project/edit": navigateState("Edit Project", applyEditProjectTemplate); break;
		
		case "/blog": navigateState("Jeff Davies' Blog", applyBlogTemplate ); break;
		case "/blog/add": navigateState("Add Blog", applyAddBlogTemplate); break;
		case "/blog/edit": navigateState("Edit Blog", applyEditBlogTemplate); break;
		
		case "/tasks": navigateState("Kanban", applyTasksTemplate); break;
		case "/tasks/add": navigateState("Add Task", applyAddTasksTemplate); break;
		case "/tasks/edit": navigateState("Edit Task", applyEditTasksTemplate); break;
		case "/tasks/edit-slots": navigateState("Edit Kanban Slots", applyEditKanbanSlotsTemplate); break;
		
		case "/users": navigateState("Users", applyUsersTemplate); break;
		case "/users/add": navigateState("Add User", applyAddUsersTemplate); break;
		case "/users/edit": navigateState("Edit User", applyEditUsersTemplate); break;

	} 
		
}

function makeBreadCrumbs () {
	//todo
}

function navigate(newroute) {
	route=newroute;
	refresh();
}


function http_post(url,payload,response,callback) {
	
}


function emptyJwt() {
	return {
		"admin" : false,
		"roles" : "",
		"username" : "guest"
	};
}

function logout() {
	jwtToken = emptyJwt();
	storeJwt();
	refresh();
}

function login() {
	var loginStatus = document.getElementById('loginStatus');
	loginStatus.innerHTML = "";
	var username = document.getElementById("username").value;
	var password = document.getElementById("password").value;
	var url = authUrl;
	var payload = {
    	"username": username,
	    "password": password
	};
	
	var json = {
    	json: JSON.stringify(payload),
    	delay: 3
	};
	fetch(url,
	{
    	method: "post", 
		headers: {
        	'Accept': 'application/json, text/plain, */*',
        	'Content-Type': 'application/json'
    	},
        body: json = JSON.stringify(payload)
	})
	.then(function(res){ 
		return res.json();
	})
	.then(function(token){ 
		jwtToken = token;
        storeJwt(token);
		if (jwtToken.loginSuccess==true) {
			var modal = document.getElementById('myModal');
			loginModal.style.display = "none";
			refresh();
		} else {
			var modal = document.getElementById('loginStatus');
			modal.innerHTML = "failed to login";
		};
	}).catch(function(err) {
		var loginStatus = document.getElementById('loginStatus');
		loginStatus.innerHTML = "failed to login";
		jwtToken = {};
	});
}


var storeJwt = function (value) {
	localStorage.setItem('jwt', JSON.stringify(value));
}


function fetchJwt() {
	var token = localStorage.getItem('jwt');
	if (token == null || token =="" || token == "undefined") {
		jwtToken = emptyJwt();
		storeJwt(jwtToken);
	} else {
		var jwtToken = JSON.parse(token);
	}
	return jwtToken;
}

window.onload = function(){
	var jwtToken=emptyJwt();
	
	var loginModal = document.getElementById('loginModal');

	var loginBtn = document.getElementById("loginBtn");
	loginBtn.onclick = function() {
		loginModal.style.display = "block";
	}

	var logoutBtn = document.getElementById("logoutBtn");
	logoutBtn.onclick = function() {
		logout();
	}

	var loginDialogClose = document.getElementById("loginClose");
	loginDialogClose.onclick = function() {
		loginModal.style.display = "none";
	}

	window.onclick = function(event) {
		if (event.target == loginModal) {
			loginModal.style.display = "none";
		}

	}
	
	refresh();
	registerServiceWorker();
}



