import ProtectedRoute from "../components/Auth/ProtectedRoute";
import Layout from "../components/Layout";
import Content from "../modules/Login";

export default function Login() {
  return (
    <ProtectedRoute inverse>
      <Layout
        page={{
          title: "Welcome",
        }}
      >
        <Content />
      </Layout>
    </ProtectedRoute>
  );
}
