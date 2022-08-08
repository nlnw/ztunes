import { Routes, Route, Navigate, BrowserRouter } from "react-router-dom";
import App from "./App";
import { getRandomSong } from "./songs";

function AppRoutes() {
  const randomSong = getRandomSong();
  return (
    <BrowserRouter>
      <Routes>
        <Route>
          <Route path=":collection">
            <Route path=":tokenId" element={<App />}></Route>
          </Route>
          <Route
            path="*"
            element={<Navigate to={`/${randomSong[0]}/${randomSong[1]}`} />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
