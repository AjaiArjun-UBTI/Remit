export default function Footer() {
  return (
    <footer className="p-4 text-center text-sm bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">
      © {new Date().getFullYear()} UB Technology Innovations, Inc.
    </footer>
  );
}