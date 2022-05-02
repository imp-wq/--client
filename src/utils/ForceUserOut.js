const ForceUserOut = () => {
    document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    localStorage.clear();
    window.location.href = '/';
}

export default ForceUserOut;