function ThemeToggle({ theme, toggleTheme }) {
  return (
    <button type="button" className="themeToggle" onClick={toggleTheme}>
      {theme === 'light' ? (
        <>
          <i className="fa-regular fa-sun"></i> Light Mode
        </>
      ) : (
        <>
          <i className="fa-regular fa-moon"></i> Dark Mode
        </>
      )}
    </button>
  )
}

export default ThemeToggle
