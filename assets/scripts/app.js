class DOMHelper{

    static ClearLisnter(element){
        const ClonedElement = element.cloneNode(true);
        element.replaceWith(ClonedElement);
        return ClonedElement;
    }
    static moveElement(elementID, newDestinationSelector){
        const element = document.getElementById(elementID);
        const destinationElement = document.querySelector(newDestinationSelector);
        destinationElement.append(element);
    }
}

class Component{
    constructor(hostElementID, insertBefore = false)
    {
        if(hostElementID)
        {
            this.hostElement = document.getElementById(hostElementID);
        }
        else
        {
            this.hostElement = document.body;
        }
        this.insertBefore= insertBefore;
    }
    hide(){
        if (this.element)
        {
            this.element.remove();
        }
    }
    show(){
        this.hostElement.insertAdjacentElement(this.insertBefore ? 'afterbegin':'beforeend',this.element);
    }
}
class Tooltip extends Component{
    constructor(closeNotifierFunction){
        super('active-projects');
        this.closeNotifier = closeNotifierFunction;
        this.create();
    }
    closeTooltip(){
        this.hide();
    }
    create(){
        const tooltipElement = document.createElement('div');
        tooltipElement.className = 'card';
        this.element = tooltipElement;
        tooltipElement.addEventListener('click',this.closeTooltip.bind(this))
        this.show();
    }
    
}

class ProjectItem{
    hasToolTip =false;
    constructor(id,updateProjectListFunction,type)
    {
        this.id = id;
        this.updateFunctionHandler = updateProjectListFunction;
        this.SwitchbuttonClick(type);
        this.moreInfobuttonClick();
    }

    SwitchbuttonClick(type){
        const element = document.getElementById(this.id);
        let SwitchBtn = element.querySelector('button:last-of-type');
        SwitchBtn = DOMHelper.ClearLisnter(SwitchBtn);
        SwitchBtn.textContent = type === 'active' ? 'Finish': 'Activate';
        SwitchBtn.addEventListener('click',this.updateFunctionHandler.bind(null,this.id));
    }
    moreInfobuttonClick(){
        const element = document.getElementById(this.id);
        const moreInfoButton = element.querySelector('button:first-of-type');
        moreInfoButton.addEventListener('click',this.showMoreInfo);
    }

    update(updateProjectListFunction,type){
        this.updateFunctionHandler = updateProjectListFunction;
        this.SwitchbuttonClick(type);
    }

    showMoreInfo(){
        if(this.hasToolTip)
        {
            return;
        }
        const tooltip = new Tooltip(() => {
            this.hasToolTip =false;
        });
        tooltip.show();
        this.hasToolTip= true;
    }

}

class ProjectList{
    projects =[];

    constructor(type){
        this.type = type;  
        const projItems = document.querySelectorAll(`#${type}-projects li`); 
        for (const projItem of projItems)
        {
            this.projects.push(new ProjectItem(projItem.id,this.switchProject.bind(this),this.type));
        }
    }

    setSwitchHandlerFunction (SwitchHandlerFunction){
        this.SwitchHandler = SwitchHandlerFunction;
    }

    switchProject(projectID){
        this.SwitchHandler(this.projects.find((p)=>{
            return p.id === projectID;
        }));
        // const ProjectIndex = this.projects.findIndex((project) =>{
        //     return project.id ===projectID;
        // });
        // this.projects.splice(ProjectIndex,1);
        this.projects = this.projects.filter((project) =>{
            return project.id !== projectID;
        });
    }

    addProject(project){
        console.log(this);
        this.projects.push(project);
        DOMHelper.moveElement(project.id,`#${this.type}-projects ul`);
        project.update(this.switchProject.bind(this),this.type);
    }
}

class App{
    static init()
    {
        const finishedProjectList = new ProjectList('finished');
        const ActiveProjectList = new ProjectList('active');
        ActiveProjectList.setSwitchHandlerFunction(finishedProjectList.addProject.bind(finishedProjectList));
        finishedProjectList.setSwitchHandlerFunction(ActiveProjectList.addProject.bind(ActiveProjectList));

    }
}

App.init();