import React, { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Button } from "react-bootstrap";

const EmpleadoDashboard = () => {
  const { user, rol, logout } = useAuth();
  const navigate = useNavigate();

  // Redirigir si no es empleado
  useEffect(() => {
    if (rol !== "empleado") {
      navigate("/login");
    }
  }, [rol, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };


  return (
    <div className="d-flex min-vh-100 mt-5 pt-5">
      {/* Sidebar */}
      <div className="bg-dark text-white p-3 mt-2" style={{ width: "250px"}}>
        <h3 className="mb-4">Empleado</h3>
        <p>Hola, {user?.email}</p>
        <hr />
        <ul className="nav flex-column">
          <li className="nav-item mb-2">
            <Button variant="outline-light" className="w-100" onClick={() => navigate("/empleado")}>
              Inicio
            </Button>
          </li>
          <li className="nav-item mb-2">
            <Button variant="outline-light" className="w-100">
              Pedidos
            </Button>
          </li>
          <li className="nav-item mb-2">
            <Button variant="outline-light" className="w-100">
              Productos
            </Button>
          </li>
          <li className="nav-item mt-4">
            <Button variant="danger" className="w-100" onClick={handleLogout}>
              Cerrar sesión
            </Button>
          </li>
        </ul>
      </div>

      {/* Contenido principal */}
      <div className="flex-grow-1 p-4 mt-2" style={{ background: "#f8f9fa" }}>
        <Container fluid>
          <Row className="mb-4">
            <Col>
              <h2>Dashboard Empleado</h2>
              <p>Bienvenido al panel de control de empleados.</p>
            </Col>
          </Row>

          <Row xs={1} md={2} lg={3} className="g-4">
            <Col>
              <Card>
                <Card.Body>
                  <Card.Title>Pedidos pendientes</Card.Title>
                  <Card.Text>Ver y procesar pedidos recientes.</Card.Text>
                  <Button variant="primary">Ir a Pedidos</Button>
                </Card.Body>
              </Card>
            </Col>

            <Col>
              <Card>
                <Card.Body>
                  <Card.Title>Productos</Card.Title>
                  <Card.Text>Ver inventario y disponibilidad de productos.</Card.Text>
                  <Button variant="primary">Ver Productos</Button>
                </Card.Body>
              </Card>
            </Col>

            <Col>
              <Card>
                <Card.Body>
                  <Card.Title>Estadísticas</Card.Title>
                  <Card.Text>Resumen de ventas y actividad reciente.</Card.Text>
                  <Button variant="primary">Ver Estadísticas</Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default EmpleadoDashboard;
