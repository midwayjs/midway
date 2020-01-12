import React, { useEffect, useState } from 'react';
import { getPing, postPing } from './adapter';

const Demo: React.FunctionComponent = function() {
  const [result, setResult] = useState();
  const [error, setError] = useState();
  const [result2, setResult2] = useState();
  const [error2, setError2] = useState();
  
  useEffect(() => {
    getPing().then(setResult).catch(setError);
    postPing().then(setResult2).catch(setError2);
  }, []);

  return (
    <div>
      <div>
        <div><span>Request:</span><p>get /demo/api/v1/ping</p></div>
        <div><span>Result:</span><p>{JSON.stringify(result)}</p></div>
        <div><span>error:</span><p>{error}</p></div>
      </div>
      <div>
        <div><span>Request:</span><p>post /demo/api/v1/ping</p></div>
        <div><span>Result:</span><p>{JSON.stringify(result2)}</p></div>
        <div><span>error:</span><p>{JSON.stringify(error2)}</p></div>
      </div>
    </div>
  )
}

export default Demo;
