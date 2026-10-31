function App() {
    const [count, setCount] = useState(0);

    return (
        <div>
            <span>{count}</span>
            <a href="/about">About</a>
        </div>
    );
}

export default App;