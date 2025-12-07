class FullName: IEquatable<FullName> {
    public FullName(string firstName, string lastName) {
        FirstName = firstName;
        LastName = lastName;
    }
    public string FirstName {get; }
    public string LastName {get; }

    public bool Equals(FullName other) {
        if (ReferenceEquals(other, null)) return false;
        if (ReferenceEquals(this, other)) return true;
        return string.Equals(FirstName, other.FirstName) && string.Equals(LastName, other.LastName);
    }

    public override bool Equals(object obj) {
        if (ReferenceEquals(obj, null)) return false;
        if (ReferenceEquals(this, obj)) return true;
        if (GetType() != obj.GetType()) return false;
        return Equals((FullName)obj);
    }

    public override int GetHashCode() {
        unchecked {
            return ((FirstName != null ? FirstName.GetHashCode() : 0) * 397) ^ (LastName != null ? LastName.GetHashCode() : 0);
        }
    }
}