import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Quiz from './pages/Quiz'
import Flashcards from './pages/Flashcards'
import StudyNotes from './pages/StudyNotes'
import Results from './pages/Results'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/flashcards" element={<Flashcards />} />
          <Route path="/study-notes" element={<StudyNotes />} />
          <Route path="/results" element={<Results />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
