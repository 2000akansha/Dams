import PropTypes from "prop-types";

const Button = ({ children, color = "primary", onClick, ...rest }) => {
  const setClass = (color) => {
    if (color === "secondary") {
      return "bg-secondary hover:bg-secondary-700 active:bg-secondary";
    } else {
      return "bg-primary hover:bg-primary-700 active:bg-primary";
    }
  };
  const baseClasses = `inline-flex items-center w-full sm:max-w-[200px] md:max-w-[250px] lg:max-w-[325px] justify-center px-4 py-2 border border-transparent rounded-lg font-medium text-white shadow-sm hover:bg-opacity-90 focus:outline-none`;

  return (
    <button
      className={`${baseClasses} ${setClass(color)}`}
      onClick={onClick && onClick}
      {...rest}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  color: PropTypes.string,
  onClick: PropTypes.func,
};

export default Button;
