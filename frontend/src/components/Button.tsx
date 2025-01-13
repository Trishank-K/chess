export const Button = ({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) => {
  return (
    <button
      onClick={onClick}
      className="bg-green-600 w-1/4 p-4 text-white text-2xl rounded-md hover:bg-green-500"
    >
      {children}
    </button>
  );
};
