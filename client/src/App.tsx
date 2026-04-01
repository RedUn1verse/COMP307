import { useEffect, useState } from 'react';

function App() {
  	const [message, setMessage] = useState('');

  	useEffect(() => {
    		fetch('/api/test')
      			.then(res => res.json())
      			.then(data => {
        			setMessage(data.message);
      			});
  	}, []);

  	return (
    		<div>
      		<h1>{message || "Wait for it"}</h1>
    		</div>
  	);
}

export default App;
