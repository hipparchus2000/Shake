//yggdrasil.js

var route="/project";
var breadcrumbs=["/"];

var projectsUrl = "/api/projects";
var blogsUrl = "/api/blogs";
var usersUrl = "/api/users";
var tasksUrl = "/api/tasks";

var authUrl = "/api/auth";

//initialise global variables used for edit
var projects={};
var tasks={};
var users={};
var blogEntries={};

function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
}

function admin() {
	navigate('/user');
}

function addButton() {
	//alert("addButton");
	route = route+"/add";
	id=null;
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

function navigateBack() {
	var lastSlashIndex = route.lastIndexOf("/");
	var newRoute = route.slice(route,lastSlashIndex);
	route = newRoute;
	refresh();
}

function cancelChanges() {
	navigateBack();
}

function saveChanges() {
	//find resource
	var lastSlashIndex = route.lastIndexOf("/");
	var urlAndRoute = route.slice(route,lastSlashIndex);
	var chunks = urlAndRoute.split("#");
	resource = chunks[1].replace("/","")+"s";
	var url="api/"+resource;
	
	refresh();
	
	if(id==null) { //then save with post
		http_post(url,payload,navigateBack,updateFailed);
	} else { //then update with put
		http_put(url,payload,navigateBack,updateFailed);
	}
	
}

function updateFailed() {
	alert("update failed");
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
	var re = new RegExp("{{"+name+"}}","g");
	node.innerHTML = node.innerHTML.replace(re, value);
}

function clearRootNode() {
	var root = document.getElementById("root");
	while (root.firstChild) {
		root.removeChild(root.firstChild);
	}
}

function appendNodeToRoot(node) {
	var root = document.getElementById("root");
	root.append(node);
}

function applyProjectsTemplate() {
	clearRootNode();
	var cardrowTemplate = document.getElementById("cardRow-template");
	var cardTemplate = document.getElementById("card-template");
	
	getUrlUsingRest(projectsUrl,function (response) {
		projects = response;
		
		var rowcount=0;
		var currentRow=null;
		
		projects.forEach(function (project) {
			if ((rowcount % 3) == 0) {
				currentRow = cardrowTemplate.cloneNode(true);
			}
			var node = cardTemplate.cloneNode(true);
			updateField( node, "title", project.title);
			updateField( node, "id", rowcount);
			updateField( node, "description", project.description);
			updateField( node, "year", project.year);
			updateField( node, "codeUrl", project.codeUrl);
			updateField( node, "siteUrl", project.siteUrl);
			updateField( node, "url", project.url);
			updateField( node, "pdfUrl", project.pdfUrl);

			var editButton="";
			if(jwtToken.roles.includes("project-editor")) {
				editButton='<i class="fa fa-trash  fa-3x pull-right" onclick="deleteButton('+rowcount+')" aria-hidden="true"></i><i class="fa fa-pencil fa-3x pull-right" onclick="editButton('+rowcount+')" aria-hidden="true"></i>';	
			}
			updateField( node, "editButton", editButton);
			
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
				appendNodeToRoot(currentRow);
			}
			rowcount++;
		});
	});
}

function applyAddProjectTemplate () {
	clearRootNode();
	var blogTemplate = document.getElementById("edit-project-template");
	var node = blogTemplate.cloneNode(true);
	var title = "";
	var description = "";
	var year="";
	var codeUrl="";
	var siteUrl="";
	var url="";
	var pdfUrl="";

	updateField( node, "editProjectProjectName", title);
	updateField( node, "editProjectProjectDescription", description);
	updateField( node, "editProjectProjectYear", year);
	updateField( node, "editProjectProjectCodeUrl", codeUrl);
	//updateField( node, "editProjectProjectSiteUrl", siteUrl);
	updateField( node, "editProjectProjectUrl", url);
	updateField( node, "editProjectProjectPdfUrl", pdfUrl);
	root.append(node);
}

function applyEditProjectTemplate () {
	applyAddProjectTemplate();
}


function applyTasksTemplate() {
	clearRootNode();
	var kanbanTemplate = document.getElementById("kanban-template");
	var slotTemplate = document.getElementById("kanban-slot-template");
	var cardTemplate = document.getElementById("kanban-task-template");
	var kanbanRoot = kanbanTemplate.cloneNode(true);
	kanbanRoot.innerHTML = kanbanRoot.innerHTML.replace(/kanban-template/g,"kanbanroot");
	root.append(kanbanRoot); 

	//todo change blog to use tasks Url (currently using blog items for example
	var id=0;
	getUrlUsingRest(blogsUrl,function (response) {
		
		tasks = response;
		var currentSlot=null;
		
		tasks.forEach(function (task) {
			//todo need to assign tasks to correct slot
			var node = cardTemplate.cloneNode(true);
			updateField( node, "storyText", task.storyText);
			updateField( node, "storyName", task.storyName);
			updateField( node, "id", "task"+id );
			
			var editButton="";
			if(jwtToken.roles.includes("kanban-editor")) {
				editButton='<i class="fa fa-trash  fa-3x pull-right" onclick="deleteButton('+id+')" aria-hidden="true"></i><i class="fa fa-pencil fa-3x pull-right" onclick="editButton('+id+')" aria-hidden="true"></i>';	
			}
			node.innerHTML = node.innerHTML.replace(/{{editButton}}/g, editButton);
			
			currentSlot = slotTemplate.cloneNode(true);
			currentSlot.id = id;
			updateField( currentSlot, "kanban-slot-template",  "slot"+id );
			updateField( currentSlot, "cards",  node.innerHTML );
			id++;
			var slots = document.getElementById("kanban-slots");
			slots.appendChild(currentSlot);

		});
		
	});

}

function applyAddTasksTemplate () {
	clearRootNode();
	var blogTemplate = document.getElementById("edit-task-template");
	var node = blogTemplate.cloneNode(true);
	var storyText = "";
	var storyName = "";
	updateField( node, "editTaskStorytext", storyText);
	updateField( node, "editTaskStoryname", storyName);
	root.append(node);
}

function applyEditTasksTemplate () {
	applyAddTasksTemplate();
}

function applyEditKanbanSlotsTemplate () {
	
}

function applyBlogTemplate() {
	clearRootNode();
	var blogTemplate = document.getElementById("blog-template");

    var id=0;	
	getUrlUsingRest(blogsUrl,function (response) {
		blogEntries = response;
		
		blogEntries.forEach(function (story) {
			var node = blogTemplate.cloneNode(true);
			
			updateField( node, "storyText", story.storyText);
			updateField( node, "storyName", story.storyName);
			updateField( node, "date", story.date);
			
			var editButton="";
			if(jwtToken.roles.includes("blog-editor")) {
				editButton='<i class="fa fa-trash  fa-3x pull-right" onclick="deleteButton('+id+')" aria-hidden="true"></i><i class="fa fa-pencil fa-3x pull-right" onclick="editButton('+id+')" aria-hidden="true"></i>';	
			}
			updateField( node, "editButton", editButton);
			root.append(node);
			id++;
		});
	});
}

function applyAddBlogTemplate () {
	clearRootNode();
	var blogTemplate = document.getElementById("edit-blog-template");
	var node = blogTemplate.cloneNode(true);
	var storyText = "";
	var storyName = "";
	var date=Date.now();
	updateField( node, "editBlogStorytext", storyText);
	updateField( node, "editBlogStoryname", storyName);
	updateField( node, "date", date);
	root.append(node);
}

function applyEditBlogTemplate () {
	applyAddBlogTemplate();
}

function applyUsersTemplate () {
	clearRootNode();
	var userTemplate = document.getElementById("user-template");

    var id=0;	
	getUrlUsingRest(usersUrl,function (response) {
		blogEntries = response;
		
		blogEntries.forEach(function (story) {
			var node = blogTemplate.cloneNode(true);
			updateField( node, "username", story.storyName);
			
			var editButton="";
			if(jwtToken.roles.includes("blog-editor")) {
				editButton='<i class="fa fa-trash  fa-3x pull-right" onclick="deleteButton('+id+')" aria-hidden="true"></i><i class="fa fa-pencil fa-3x pull-right" onclick="editButton('+id+')" aria-hidden="true"></i>';	
			}
			updateField( node, "editButton", editButton);
			root.append(node);
			id++;
		});
	});
}

function applyAddUsersTemplate () {
	
}

function applyEditUsersTemplate () {
	
}

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
	
	var adminButton = document.getElementById("adminButton"); 
	if (jwtToken.admin == true) {
		adminButton.style.display = "block";
	} else {
		adminButton.style.display = "none";
	}

	switch(route) {
		
		case "/project":     navigateState("Yggsrasil Projects", applyProjectsTemplate ); break;
		case "/project/add": navigateState("Add Project", applyAddProjectTemplate); break;
		case "/project/edit": navigateState("Edit Project", applyEditProjectTemplate); break;
		
		case "/blog": navigateState("Jeff Davies' Blog", applyBlogTemplate ); break;
		case "/blog/add": navigateState("Add Blog", applyAddBlogTemplate); break;
		case "/blog/edit": navigateState("Edit Blog", applyEditBlogTemplate); break;
		
		case "/task": navigateState("Kanban", applyTasksTemplate); break;
		case "/task/add": navigateState("Add Task", applyAddTasksTemplate); break;
		case "/task/edit": navigateState("Edit Task", applyEditTasksTemplate); break;
		case "/task/edit-slots": navigateState("Edit Kanban Slots", applyEditKanbanSlotsTemplate); break;
		
		case "/user": navigateState("Users", applyUsersTemplate); break;
		case "/user/add": navigateState("Add User", applyAddUsersTemplate); break;
		case "/user/edit": navigateState("Edit User", applyEditUsersTemplate); break;

	} 
		
}

function makeBreadCrumbs () {
	//todo
}

function navigate(newroute) {
	route=newroute;
	refresh();
}

function http_post(url,payload,callback,errorCallback) {
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
	.then(callback).catch(errorCallback);
}

function http_put(url,payload,callback,errorCallback) {
	var json = {
    	json: JSON.stringify(payload),
    	delay: 3
	};
	fetch(url,
	{
    	method: "put", 
		headers: {
        	'Accept': 'application/json, text/plain, */*',
        	'Content-Type': 'application/json'
    	},
        body: json = JSON.stringify(payload)
	})
	.then(function(res){ 
		return res.json();
	})
	.then(callback).catch(errorCallback);
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
	var id=null;
	
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



