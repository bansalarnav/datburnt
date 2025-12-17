import ProtectedRoute from "../components/Auth/ProtectedRoute";
import Layout from "../components/Layout";
import Content from "../modules/Register";

export default function Register() {
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
