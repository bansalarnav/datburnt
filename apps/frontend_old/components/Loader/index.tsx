interface LoaderProps {
  center?: boolean;
}

const Loader = ({ center }: LoaderProps) => {
  if (center) {
    return (
      <div className="mx-auto">
        <div className="inline-block border-4 border-primary border-l-transparent rounded-full w-[30px] h-[30px] animate-spin" />
      </div>
    );
  }

  return (
    <div className="inline-block border-4 border-primary border-l-transparent rounded-full w-[30px] h-[30px] animate-spin" />
  );
};

export default Loader;
