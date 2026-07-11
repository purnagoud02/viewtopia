import { useContext } from "react";
import MovieContext from "./MovieContext";

export const useMovie = () => useContext(MovieContext);

export default useMovie;
