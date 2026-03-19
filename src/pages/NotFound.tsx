import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center space-y-6">
        <h1 className="text-8xl sm:text-9xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}>
          404
        </h1>
        <p className="text-xl sm:text-2xl font-semibold text-foreground">
          This page doesn't exist.
        </p>
        <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
          The page you're looking for has moved or never existed.
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-3 text-sm font-medium text-primary-foreground transition-all hover:scale-105 hover:shadow-lg active:scale-95"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;