import React from 'react';
import MainRoute from './route/index.route'
import { HLayout } from './views/layout/index.layout'
import './App.css';

const App: React.FC = () => {
  return (
    <div className="App">
      <HLayout>
        <MainRoute></MainRoute>
      </HLayout>
    </div>
  )
}

export default App;
