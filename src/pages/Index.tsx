import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { isAuthenticated, user } = useAuth();
  
  if (isAuthenticated && user) {
    return <Navigate to={`/${user.role}`} replace />;
  }
  
  return <Navigate to="/" replace />;
};

export default Index;
