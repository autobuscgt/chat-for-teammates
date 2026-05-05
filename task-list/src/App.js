const tasks = [
  {id: 1, name: `Task 1`, description:'Описание', completed: false},
  {id: 2, name: `Task 2`, description:'Описание', completed: true},
  {id: 3, name: `Task 3`, description:'Описание', completed: false},
  {id: 4, name: `Task 4`, description:'Описание', completed: true},
  {id: 5, name: `Task 5`, description:'Описание', completed: false},
]
const nextId = 3;

function App() {
  return (
    <div className="App">
    <div className="header-container">
        <div className="logo">logo</div>
        <div className="header-container-block-1">block1</div>
        <div className="header-container-block-2">block2</div>
    </div>
      <div className="tasks-container">
        {tasks.map(task => (
          <div key={task.id} className="task-card">
            <h1>{task.name}</h1>
            <p>{task.description}</p>
            {/* <input value={task.completed} type="checkbox"/> */}
          </div>
        ))}
    </div>
    <div className="footer-container">

    </div>
    </div>
  );  
}

export default App;
