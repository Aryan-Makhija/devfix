import { useEffect , useState} from "react";
import axios from "axios";
import { Argument } from "commander";
function App() {
    useEffect(() => { });

    const [count, setCount] = useState(0);

    axios.get("/api");

    const result = calculateSomething();

    return result + count;
    const program = new Command();
}

export default App;