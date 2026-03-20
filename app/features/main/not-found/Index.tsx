const NotFoundRender = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-6">
      <div className="flex flex-col items-center justify-center w-full max-w-md">
        {/* 404 Icon */}
        <div className="mb-8">
          <div className="text-8xl font-bold text-[var(--primary-orange-main)] opacity-80">
            404
          </div>
        </div>

        {/* Title */}
        <h1 className="text-center mb-4 text-[32px] font-bold leading-[39px] text-[var(--foreground)]">
          Page Not Found
        </h1>

        {/* Description */}
        <p className="text-center mb-8 text-lg font-normal leading-[27px] text-[var(--textcolor-gray-01)]">
          Sorry, the page you&apos;re looking for does not exist.
        </p>
      </div>
    </div>
  );
};

export default NotFoundRender;
