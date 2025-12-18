import ProtectedRoute from "../components/Auth/ProtectedRoute";
import Layout from "../components/Layout";
import Content from "../modules/Home";

export default function Home() {
  return (
    <ProtectedRoute>
      <Layout
        page={{
          title: "Home",
        }}
      >
        <Content />
      </Layout>
    </ProtectedRoute>
  );
}
